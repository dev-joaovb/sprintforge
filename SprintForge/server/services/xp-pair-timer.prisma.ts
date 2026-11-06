
import prisma from '../db/prisma';
import type { AuthPayload } from '../middleware/auth';
import { hasXpProjectAccess } from './xp-access.prisma';
import {
  startPairTimer,
  pausePairTimer,
  resumePairTimer,
  resetPairTimer,
  canRotatePairRoles,
  type PairTimerState,
} from './xp-pair-timer.service';

export type PairTimerAction =
  | 'start'
  | 'pause'
  | 'resume'
  | 'reset'
  | 'rotate';

export class PairTimerError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'PairTimerError';
  }
}

export async function updatePairTimer(
  sessionId: string,
  user: AuthPayload,
  action: PairTimerAction
) {
  if (!sessionId?.trim()) {
    throw new PairTimerError(400, 'Identificador da sessão obrigatório.');
  }

  const session = await prisma.pairSession.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    throw new PairTimerError(404, 'Sessão de Pair Programming não encontrada.');
  }

  const authorized = await hasXpProjectAccess(session.projectId, user);

  if (!authorized) {
    throw new PairTimerError(403, 'Você não possui acesso a esta sessão.');
  }

  if (session.status !== 'ACTIVE') {
    throw new PairTimerError(409, 'A sessão não está ativa.');
  }

  const now = new Date();

  const timer: PairTimerState = {
    timerStatus: session.timerStatus,
    timerRemainingSeconds: session.timerRemainingSeconds,
    timerEndsAt: session.timerEndsAt,
  };

  let nextTimer: PairTimerState;
  let rotate = false;

  try {
    switch (action) {
      case 'start':
        nextTimer = startPairTimer(timer, now);
        break;
      case 'pause':
        nextTimer = pausePairTimer(timer, now);
        break;
      case 'resume':
        nextTimer = resumePairTimer(timer, now);
        break;
      case 'reset':
        nextTimer = resetPairTimer();
        break;
      case 'rotate':
        if (!canRotatePairRoles(timer, now)) {
          throw new PairTimerError(
            409,
            'O ciclo de 25 minutos ainda não terminou.'
          );
        }

        nextTimer = resetPairTimer();
        rotate = true;
        break;
      default:
        throw new PairTimerError(400, 'Operação inválida.');
    }
  } catch (error) {
    if (error instanceof PairTimerError) {
      throw error;
    }

    throw new PairTimerError(
      409,
      error instanceof Error ? error.message : 'Transição inválida.'
    );
  }

  const result = await prisma.pairSession.updateMany({
    where: {
      id: session.id,
      projectId: session.projectId,
      status: 'ACTIVE',
      timerVersion: session.timerVersion,
    },
    data: {
      timerStatus: nextTimer.timerStatus,
      timerRemainingSeconds: nextTimer.timerRemainingSeconds,
      timerEndsAt: nextTimer.timerEndsAt,
      timerVersion: { increment: 1 },
      ...(rotate
        ? {
            driverId: session.navigatorId,
            driverName: session.navigatorName,
            navigatorId: session.driverId,
            navigatorName: session.driverName,
            rotationCount: { increment: 1 },
          }
        : {}),
    },
  });

  if (result.count !== 1) {
    throw new PairTimerError(
      409,
      'A sessão foi modificada por outra operação. Atualize e tente novamente.'
    );
  }

  return prisma.pairSession.findUnique({
    where: { id: session.id },
  });
}
