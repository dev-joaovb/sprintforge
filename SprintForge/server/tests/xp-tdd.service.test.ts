import test, { mock } from 'node:test';
import assert from 'node:assert/strict';

let accessAllowed = true;
let currentStatus: 'RED' | 'GREEN' | 'REFACTORED' = 'RED';
let conflict = false;
let createdCount = 0;
let updateCount = 0;

const prismaMock = {
  tddTest: {
    create: async ({ data }: any) => {
      createdCount++;
      return {
        id: 'test-1',
        ...data,
      };
    },
    findUnique: async () => ({
      id: 'test-1',
      projectId: 'project-1',
      cycleStatus: currentStatus,
    }),
    updateMany: async ({ where, data }: any) => {
      if (conflict || where.cycleStatus !== currentStatus) {
        return { count: 0 };
      }

      currentStatus = data.cycleStatus;
      updateCount++;

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

const { createTddTest, advanceTddCycle, TddError } =
  await import('../services/xp-tdd.prisma');

const user = {
  id: 'user-1',
  email: 'user@example.com',
  name: 'Usuário de Teste',
} as any;

test.beforeEach(() => {
  accessAllowed = true;
  currentStatus = 'RED';
  conflict = false;
  createdCount = 0;
  updateCount = 0;
});

test('cria teste TDD em RED', async () => {
  const result = await createTddTest({
    projectId: 'project-1',
    featureName: 'Autenticação',
    testName: 'deve validar senha',
    codeSnippet: 'expect(true).toBe(true)',
  }, user);

  assert.equal(result.cycleStatus, 'RED');
  assert.equal(result.featureName, 'Autenticação');
  assert.equal(createdCount, 1);
});

test('rejeita nome de teste vazio', async () => {
  await assert.rejects(
    createTddTest({
      projectId: 'project-1',
      featureName: 'Autenticação',
      testName: ' ',
    }, user),
    (error: unknown) =>
      error instanceof TddError && error.statusCode === 400
  );

  assert.equal(createdCount, 0);
});

test('rejeita acesso não autorizado', async () => {
  accessAllowed = false;

  await assert.rejects(
    createTddTest({
      projectId: 'project-1',
      featureName: 'Autenticação',
      testName: 'teste',
    }, user),
    (error: unknown) =>
      error instanceof TddError && error.statusCode === 403
  );

  assert.equal(createdCount, 0);
});

test('avança RED para GREEN', async () => {
  const result = await advanceTddCycle('test-1', user);

  assert.equal(result.cycleStatus, 'GREEN');
  assert.equal(updateCount, 1);
});

test('avança GREEN para REFACTORED', async () => {
  currentStatus = 'GREEN';

  const result = await advanceTddCycle('test-1', user);

  assert.equal(result.cycleStatus, 'REFACTORED');
});

test('avança REFACTORED para RED', async () => {
  currentStatus = 'REFACTORED';

  const result = await advanceTddCycle('test-1', user);

  assert.equal(result.cycleStatus, 'RED');
});

test('rejeita atualização sem autorização', async () => {
  accessAllowed = false;

  await assert.rejects(
    advanceTddCycle('test-1', user),
    (error: unknown) =>
      error instanceof TddError && error.statusCode === 403
  );

  assert.equal(updateCount, 0);
});

test('retorna conflito HTTP 409 em atualização concorrente', async () => {
  conflict = true;

  await assert.rejects(
    advanceTddCycle('test-1', user),
    (error: unknown) =>
      error instanceof TddError && error.statusCode === 409
  );

  assert.equal(updateCount, 0);
});
