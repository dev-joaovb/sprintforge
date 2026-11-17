import prisma from '../db/prisma';
import type { AuthPayload } from '../middleware/auth';
import { hasXpProjectAccess } from './xp-access.prisma';
import {
  pauseSessionTimer,
  resumeSessionTimer,
  type SessionTimeState,
} from './xp-session-time.service';

export type SessionTimerAction = 'pause' | 'resume';

export class SessionTimerError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'SessionTimerError';
  }
}

export async function updateSessionTimer(
  sessionId: string,
  user: AuthPayload,
  action: SessionTimerAction,
  now: Date = new Date()
) {
  if (!sessionId?.trim()) {
    throw new SessionTimerError(400, 'Identificador da sessão obrigatório.');
  }

  if (action !== 'pause' && action !== 'resume') {
    throw new SessionTimerError(400, 'Operação de cronômetro inválida.');
  }

  const session = await prisma.pairSession.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    throw new SessionTimerError(404, 'Sessão de Pair Programming não encontrada.');
  }

  const authorized = await hasXpProjectAccess(session.projectId, user);

  if (!authorized) {
    throw new SessionTimerError(403, 'Você não possui acesso a esta sessão.');
  }

  if (session.status !== 'ACTIVE') {
    throw new SessionTimerError(409, 'A sessão não está ativa.');
  }

  const timer: SessionTimeState = {
    sessionTimerStatus: session.sessionTimerStatus,
    sessionElapsedSeconds: session.sessionElapsedSeconds,
    sessionTimerStartedAt: session.sessionTimerStartedAt,
  };

  let nextTimer: SessionTimeState;

  try {
    nextTimer =
      action === 'pause'
        ? pauseSessionTimer(timer, now)
        : resumeSessionTimer(timer, now);
  } catch (error) {
    throw new SessionTimerError(
      409,
      error instanceof Error ? error.message : 'Transição inválida.'
    );
  }

  const result = await prisma.pairSession.updateMany({
    where: {
      id: session.id,
      projectId: session.projectId,
      status: 'ACTIVE',
      sessionTimerVersion: session.sessionTimerVersion,
    },
    data: {
      ...nextTimer,
      sessionTimerVersion: { increment: 1 },
    },
  });

  if (result.count !== 1) {
    throw new SessionTimerError(
      409,
      'A sessão foi modificada por outra operação. Atualize e tente novamente.'
    );
  }

  return prisma.pairSession.findUnique({
    where: { id: session.id },
  });
}
