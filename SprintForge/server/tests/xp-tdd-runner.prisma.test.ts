import test, { mock } from 'node:test';
import assert from 'node:assert/strict';

let accessAllowed = false;
let updateCalls = 0;
let executionCalls = 0;

const prismaMock = {
  tddTest: {
    findUnique: async () => ({
      id: 'test-1',
      projectId: 'project-1',
      codeSnippet: 'console.log("teste")',
      status: 'RED',
    }),
    updateMany: async (_args?: any) => {
      updateCalls++;
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

const { runTddExecution } =
  await import('../services/xp-tdd-runner.prisma');

const { TddError } =
  await import('../services/xp-tdd.prisma');

const user = {
  id: 'user-1',
  email: 'user@example.com',
  name: 'Usuário de Teste',
};

test.beforeEach(() => {
  accessAllowed = false;
  updateCalls = 0;
  executionCalls = 0;
});

test('nega execução TDD sem autorização e preserva o registro', async () => {
  const executor = {
    execute: async () => {
      executionCalls++;

      return {
        status: 'PASS' as const,
        executionTimeMs: 10,
        error: null,
      };
    },
  };

  await assert.rejects(
    runTddExecution('test-1', user, executor),
    (error: unknown) =>
      error instanceof TddError &&
      error.statusCode === 403
  );

  assert.equal(executionCalls, 0);
  assert.equal(updateCalls, 0);
});

test('retorna 409 quando o teste já está em execução', async () => {
  accessAllowed = true;

  const originalUpdateMany = prismaMock.tddTest.updateMany;
  prismaMock.tddTest.updateMany = async () => {
    updateCalls++;
    return { count: 0 };
  };

  const executor = {
    execute: async () => {
      executionCalls++;

      return {
        status: 'PASS' as const,
        executionTimeMs: 10,
        error: null,
      };
    },
  };

  try {
    await assert.rejects(
      runTddExecution('test-1', user, executor),
      (error: unknown) =>
        error instanceof TddError &&
        error.statusCode === 409
    );

    assert.equal(updateCalls, 1);
    assert.equal(executionCalls, 0);
  } finally {
    prismaMock.tddTest.updateMany = originalUpdateMany;
  }
});

test('persiste PASS, duração e data após execução bem-sucedida', async () => {
  accessAllowed = true;

  const updates: any[] = [];
  const originalUpdateMany = prismaMock.tddTest.updateMany;

  prismaMock.tddTest.updateMany = async (args: any) => {
    updateCalls++;
    updates.push(args);
    return { count: 1 };
  };

  const executor = {
    execute: async (codeSnippet: string) => {
      executionCalls++;
      assert.equal(codeSnippet, 'console.log("teste")');

      return {
        status: 'PASS' as const,
        executionTimeMs: 125,
        error: null,
      };
    },
  };

  try {
    await runTddExecution('test-1', user, executor);

    assert.equal(executionCalls, 1);
    assert.equal(updateCalls, 2);
    assert.equal(updates.length, 2);

    assert.equal(updates[0].data.status, 'RUNNING');
    assert.equal(updates[0].data.executionError, null);

    assert.equal(updates[1].data.status, 'PASS');
    assert.equal(updates[1].data.executionTimeMs, 125);
    assert.equal(updates[1].data.executionError, null);
    assert.ok(updates[1].data.lastRun instanceof Date);

    assert.equal(updates[1].where.status, 'RUNNING');
  } finally {
    prismaMock.tddTest.updateMany = originalUpdateMany;
  }
});

test('persiste ERROR sem expor detalhes de falha interna', async () => {
  accessAllowed = true;

  const updates: any[] = [];
  const originalUpdateMany = prismaMock.tddTest.updateMany;

  prismaMock.tddTest.updateMany = async (args: any) => {
    updateCalls++;
    updates.push(args);
    return { count: 1 };
  };

  const executor = {
    execute: async () => {
      executionCalls++;
      throw new Error('Segredo interno do executor');
    },
  };

  try {
    await runTddExecution('test-1', user, executor);

    assert.equal(executionCalls, 1);
    assert.equal(updateCalls, 2);

    assert.equal(updates[0].data.status, 'RUNNING');
    assert.equal(updates[1].data.status, 'ERROR');
    assert.equal(updates[1].data.executionTimeMs, 0);
    assert.equal(
      updates[1].data.executionError,
      'Falha interna no executor TDD.'
    );

    assert.ok(updates[1].data.lastRun instanceof Date);
    assert.equal(updates[1].where.status, 'RUNNING');

    assert.doesNotMatch(
      updates[1].data.executionError,
      /Segredo interno/
    );
  } finally {
    prismaMock.tddTest.updateMany = originalUpdateMany;
  }
});
