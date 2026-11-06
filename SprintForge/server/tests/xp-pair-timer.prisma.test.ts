
import test, { mock } from 'node:test';
import assert from 'node:assert/strict';

type TimerStatus = 'IDLE' | 'RUNNING' | 'PAUSED';

type Session = {
  id: string;
  projectId: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  timerStatus: TimerStatus;
  timerRemainingSeconds: number;
  timerEndsAt: Date | null;
  timerVersion: number;
  rotationCount: number;
  driverId: string;
  driverName: string;
  navigatorId: string;
  navigatorName: string;
};

const initialSession: Session = {
  id: 'session-1',
  projectId: 'project-1',
  status: 'ACTIVE',
  timerStatus: 'IDLE',
  timerRemainingSeconds: 1500,
  timerEndsAt: null,
  timerVersion: 0,
  rotationCount: 0,
  driverId: 'driver-1',
  driverName: 'Driver',
  navigatorId: 'navigator-1',
  navigatorName: 'Navigator',
};

let session: Session = { ...initialSession };
let accessAllowed = true;
let forceConflict = false;
let updateCalls = 0;

const prismaMock = {
  pairSession: {
    async findUnique() {
      return session ? { ...session } : null;
    },
    async updateMany(args: any) {
      updateCalls++;

      if (
        forceConflict ||
        session.status !== args.where.status ||
        session.timerVersion !== args.where.timerVersion
      ) {
        return { count: 0 };
      }

      const data = args.data;

      session = {
        ...session,
        timerStatus: data.timerStatus,
        timerRemainingSeconds: data.timerRemainingSeconds,
        timerEndsAt: data.timerEndsAt,
        timerVersion: session.timerVersion + 1,
        rotationCount: data.rotationCount
          ? session.rotationCount + 1
          : session.rotationCount,
        driverId: data.driverId ?? session.driverId,
        driverName: data.driverName ?? session.driverName,
        navigatorId: data.navigatorId ?? session.navigatorId,
        navigatorName: data.navigatorName ?? session.navigatorName,
      };

      return { count: 1 };
    },
  },
};

mock.module('../db/prisma', {
  defaultExport: prismaMock,
});

mock.module('../services/xp-access.prisma', {
  namedExports: {
    hasXpProjectAccess: async () => accessAllowed,
  },
});

const { updatePairTimer, PairTimerError } =
  await import('../services/xp-pair-timer.prisma');

const user = {
  id: 'user-1',
  email: 'user@example.com',
  name: 'Usuário',
};

function resetMocks() {
  session = { ...initialSession };
  accessAllowed = true;
  forceConflict = false;
  updateCalls = 0;
}

test('inicia e persiste o cronômetro', async () => {
  resetMocks();

  const result = await updatePairTimer('session-1', user, 'start');

  assert.equal(result?.timerStatus, 'RUNNING');
  assert.equal(result?.timerVersion, 1);
  assert.equal(updateCalls, 1);
});

test('nega acesso sem modificar a sessão', async () => {
  resetMocks();
  accessAllowed = false;

  await assert.rejects(
    updatePairTimer('session-1', user, 'start'),
    (error: unknown) =>
      error instanceof PairTimerError && error.statusCode === 403
  );

  assert.equal(updateCalls, 0);
});

test('impede alterações em sessões concluídas', async () => {
  resetMocks();
  session.status = 'COMPLETED';

  await assert.rejects(
    updatePairTimer('session-1', user, 'start'),
    (error: unknown) =>
      error instanceof PairTimerError && error.statusCode === 409
  );

  assert.equal(updateCalls, 0);
});

test('detecta conflitos de concorrência', async () => {
  resetMocks();
  forceConflict = true;

  await assert.rejects(
    updatePairTimer('session-1', user, 'start'),
    (error: unknown) =>
      error instanceof PairTimerError && error.statusCode === 409
  );
});

test('impede alternância antes do término do ciclo', async () => {
  resetMocks();

  session.timerStatus = 'RUNNING';
  session.timerEndsAt = new Date(Date.now() + 60_000);

  await assert.rejects(
    updatePairTimer('session-1', user, 'rotate'),
    (error: unknown) =>
      error instanceof PairTimerError && error.statusCode === 409
  );

  assert.equal(updateCalls, 0);
});

test('alterna Driver e Navigator após o ciclo', async () => {
  resetMocks();

  session.timerStatus = 'RUNNING';
  session.timerEndsAt = new Date(Date.now() - 1_000);

  const result = await updatePairTimer('session-1', user, 'rotate');

  assert.equal(result?.driverId, 'navigator-1');
  assert.equal(result?.navigatorId, 'driver-1');
  assert.equal(result?.rotationCount, 1);
  assert.equal(result?.timerStatus, 'IDLE');
  assert.equal(result?.timerVersion, 1);
});

test('impede iniciar o cronômetro duas vezes', async () => {
  resetMocks();

  await updatePairTimer('session-1', user, 'start');

  await assert.rejects(
    updatePairTimer('session-1', user, 'start'),
    (error: unknown) =>
      error instanceof PairTimerError && error.statusCode === 409
  );
});
