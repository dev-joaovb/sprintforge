import test, { mock } from 'node:test';
import assert from 'node:assert/strict';

let executionCalls = 0;
let executorCreated = 0;
let simulatedError: Error | null = null;

const simulatedTest = {
  id: 'teste-http',
  status: 'PASS',
  executionTimeMs: 120,
  executionError: null,
};

// Impede a inicialização de conexões reais durante os testes HTTP.
mock.module('../db/prisma', {
  defaultExport: {},
});

mock.module('../services/xp-access.prisma', {
  namedExports: {
    hasXpProjectAccess: async () => true,
  },
});

mock.module('../services/xp-tdd-runner.prisma', {
  namedExports: {
    runTddExecution: async (
      _id: string,
      _user: unknown,
      executor: unknown
    ) => {
      executionCalls++;

      if (!executor) {
        const error = new Error('Execução TDD indisponível.');
        Object.assign(error, { statusCode: 503 });
        throw error;
      }

      if (simulatedError) {
        throw simulatedError;
      }

      return simulatedTest;
    },
  },
});

mock.module('../services/xp-tdd-docker-executor', {
  namedExports: {
    DockerTddExecutor: class {
      constructor() {
        executorCreated++;
      }
    },
  },
});

mock.module('../services/xp-tdd-config', {
  namedExports: {
    isTddExecutorEnabled: () =>
      process.env.TDD_EXECUTOR_ENABLED === 'true',
  },
});

const { XpController } = await import('../controllers/xp.controller');

function response() {
  const result = {
    statusCode: 200,
    body: undefined as any,
  };

  const res = {
    status(code: number) {
      result.statusCode = code;
      return this;
    },
    json(body: unknown) {
      result.body = body;
      return this;
    },
  };

  return { res, result };
}

test('executa TDD quando habilitado', async () => {
  const original = process.env.TDD_EXECUTOR_ENABLED;
  process.env.TDD_EXECUTOR_ENABLED = 'true';

  try {
    const before = executionCalls;
    const createdBefore = executorCreated;
    const { res, result } = response();

    await XpController.runTddTest({
      params: { id: 'teste-http' },
      user: { id: 'usuario-1' },
    } as any, res as any);

    assert.equal(result.statusCode, 200);
    assert.equal(result.body.success, true);
    assert.deepEqual(result.body.data.test, simulatedTest);
    assert.equal(executionCalls, before + 1);
    assert.equal(executorCreated, createdBefore + 1);
  } finally {
    if (original === undefined) {
      delete process.env.TDD_EXECUTOR_ENABLED;
    } else {
      process.env.TDD_EXECUTOR_ENABLED = original;
    }
  }
});

test('não executa TDD sem autenticação', async () => {
  const before = executionCalls;
  const { res, result } = response();

  await XpController.runTddTest({
    params: { id: 'teste-http' },
  } as any, res as any);

  assert.equal(result.statusCode, 401);
  assert.equal(executionCalls, before);
});

test('não executa TDD com identificador vazio', async () => {
  const before = executionCalls;
  const { res, result } = response();

  await XpController.runTddTest({
    params: { id: '' },
    user: { id: 'usuario-1' },
  } as any, res as any);

  assert.equal(result.statusCode, 400);
  assert.equal(executionCalls, before);
});

test('preserva o status HTTP de erros TDD', async () => {
  const { TddError } = await import('../services/xp-tdd.prisma');
  const original = process.env.TDD_EXECUTOR_ENABLED;
  process.env.TDD_EXECUTOR_ENABLED = 'true';

  try {
    simulatedError = new TddError(403, 'Acesso negado ao projeto.');
    const { res, result } = response();

    await XpController.runTddTest({
      params: { id: 'teste-http' },
      user: { id: 'usuario-1' },
    } as any, res as any);

    assert.equal(result.statusCode, 403);
    assert.deepEqual(result.body, {
      success: false,
      message: 'Acesso negado ao projeto.',
    });
  } finally {
    simulatedError = null;
    if (original === undefined) {
      delete process.env.TDD_EXECUTOR_ENABLED;
    } else {
      process.env.TDD_EXECUTOR_ENABLED = original;
    }
  }
});

test('retorna 500 sem expor detalhes de erros inesperados', async () => {
  const original = process.env.TDD_EXECUTOR_ENABLED;
  const originalConsoleError = console.error;
  process.env.TDD_EXECUTOR_ENABLED = 'true';

  try {
    simulatedError = new Error('Detalhes internos confidenciais');
    console.error = () => {};

    const { res, result } = response();

    await XpController.runTddTest({
      params: { id: 'teste-http' },
      user: { id: 'usuario-1' },
    } as any, res as any);

    assert.equal(result.statusCode, 500);
    assert.deepEqual(result.body, {
      success: false,
      message: 'Erro interno ao executar teste TDD.',
    });
  } finally {
    simulatedError = null;
    console.error = originalConsoleError;

    if (original === undefined) {
      delete process.env.TDD_EXECUTOR_ENABLED;
    } else {
      process.env.TDD_EXECUTOR_ENABLED = original;
    }
  }
});
