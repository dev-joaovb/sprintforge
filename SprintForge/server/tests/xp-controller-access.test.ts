import test, { mock } from 'node:test';
import assert from 'node:assert/strict';

const calls = {
  sessionsQueried: 0,
  membersQueried: 0,
  sessionCreated: 0,
  tddUpdated: 0,
  ciCountQueried: 0,
  ciCreated: 0,
  tddQueried: 0,
  ciQueried: 0,
};

const prismaMock = {
  pairSession: {
    findMany: async () => {
      calls.sessionsQueried++;
      return [];
    },
    create: async () => {
      calls.sessionCreated++;
      return {};
    },
  },
  projectMember: {
    findMany: async () => {
      calls.membersQueried++;
      return accessAllowed
        ? [{ userId: 'driver-1' }, { userId: 'navigator-1' }]
        : [];
    },
  },
  tddTest: {
    findMany: async () => {
      calls.tddQueried++;
      return [];
    },
    findUnique: async () => ({
      projectId: 'project-restrito',
    }),
    update: async () => {
      calls.tddUpdated++;
      return {};
    },
  },
  ciBuild: {
    findMany: async () => {
      calls.ciQueried++;
      return [];
    },
    count: async () => {
      calls.ciCountQueried++;
      return 0;
    },
    create: async () => {
      calls.ciCreated++;
      return {};
    },
  },
};

mock.module('../db/prisma', {
  defaultExport: prismaMock,
});

let accessAllowed = false;

mock.module('../services/xp-access.prisma', {
  namedExports: {
    hasXpProjectAccess: async () => accessAllowed,
  },
});

const { XpController } = await import('../controllers/xp.controller');

function createRequest(data: Record<string, unknown>) {
  return {
    ...data,
    user: {
      id: 'usuario-externo',
      email: 'externo@example.com',
      name: 'Usuário Externo',
    },
  };
}

function createResponse() {
  const result = {
    statusCode: 200,
    body: undefined as unknown,
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

test('GET Pair Sessions: nega acesso sem consultar sessões', async () => {
  const req = createRequest({
    params: { projectId: 'project-restrito' },
  });

  const { res, result } = createResponse();
  const before = calls.sessionsQueried;

  await XpController.getPairSessions(req as any, res as any);

  assert.equal(result.statusCode, 403, JSON.stringify(result.body));
  assert.equal(calls.sessionsQueried, before);
});

test('POST Pair Session: nega acesso sem consultar membros ou criar sessão', async () => {
  const req = createRequest({
    body: {
      projectId: 'project-restrito',
      driverId: 'driver-1',
      navigatorId: 'navigator-1',
      taskTitle: 'Implementar funcionalidade',
      branchName: 'feat/teste',
    },
  });

  const { res, result } = createResponse();
  const membersBefore = calls.membersQueried;
  const sessionsBefore = calls.sessionCreated;

  await XpController.createPairSession(req as any, res as any);

  assert.equal(result.statusCode, 403, JSON.stringify(result.body));
  assert.equal(calls.membersQueried, membersBefore);
  assert.equal(calls.sessionCreated, sessionsBefore);
});

test('POST Run TDD: nega acesso sem atualizar o teste', async () => {
  const req = createRequest({
    params: { id: 'teste-restrito' },
  });

  const { res, result } = createResponse();
  const before = calls.tddUpdated;

  await XpController.runTddTest(req as any, res as any);

  assert.equal(result.statusCode, 403, JSON.stringify(result.body));
  assert.equal(calls.tddUpdated, before);
});

test('POST Trigger CI: nega acesso sem criar build', async () => {
  const req = createRequest({
    body: {
      projectId: 'project-restrito',
      branch: 'main',
    },
  });

  const { res, result } = createResponse();
  const countBefore = calls.ciCountQueried;
  const createdBefore = calls.ciCreated;

  await XpController.triggerCiBuild(req as any, res as any);

  assert.equal(result.statusCode, 403, JSON.stringify(result.body));
  assert.equal(calls.ciCountQueried, countBefore);
  assert.equal(calls.ciCreated, createdBefore);
});

test('GET TDD: nega acesso sem consultar testes', async () => {
  const req = createRequest({
    params: { projectId: 'project-restrito' },
  });

  const { res, result } = createResponse();
  const before = calls.tddQueried;

  await XpController.getTddTests(req as any, res as any);

  assert.equal(result.statusCode, 403, JSON.stringify(result.body));
  assert.equal(calls.tddQueried, before);
});

test('GET CI: nega acesso sem consultar builds', async () => {
  const req = createRequest({
    params: { projectId: 'project-restrito' },
  });

  const { res, result } = createResponse();
  const before = calls.ciQueried;

  await XpController.getCiBuilds(req as any, res as any);

  assert.equal(result.statusCode, 403, JSON.stringify(result.body));
  assert.equal(calls.ciQueried, before);
});

test('GET Pair Sessions: permite consulta para usuário autorizado', async () => {
  accessAllowed = true;

  try {
    const req = createRequest({
      params: { projectId: 'project-autorizado' },
    });

    const { res, result } = createResponse();
    const before = calls.sessionsQueried;

    await XpController.getPairSessions(req as any, res as any);

    assert.equal(result.statusCode, 200, JSON.stringify(result.body));
    assert.equal(calls.sessionsQueried, before + 1);
    assert.deepEqual(result.body, {
      success: true,
      data: { sessions: [] },
    });
  } finally {
    accessAllowed = false;
  }
});

test('GET TDD: permite consulta para usuário autorizado', async () => {
  accessAllowed = true;

  try {
    const req = createRequest({
      params: { projectId: 'project-autorizado' },
    });

    const { res, result } = createResponse();
    const before = calls.tddQueried;

    await XpController.getTddTests(req as any, res as any);

    assert.equal(result.statusCode, 200, JSON.stringify(result.body));
    assert.equal(calls.tddQueried, before + 1);
    assert.deepEqual(result.body, {
      success: true,
      data: { tests: [] },
    });
  } finally {
    accessAllowed = false;
  }
});

test('GET CI: permite consulta para usuário autorizado', async () => {
  accessAllowed = true;

  try {
    const req = createRequest({
      params: { projectId: 'project-autorizado' },
    });

    const { res, result } = createResponse();
    const before = calls.ciQueried;

    await XpController.getCiBuilds(req as any, res as any);

    assert.equal(result.statusCode, 200, JSON.stringify(result.body));
    assert.equal(calls.ciQueried, before + 1);
    assert.deepEqual(result.body, {
      success: true,
      data: { builds: [] },
    });
  } finally {
    accessAllowed = false;
  }
});

test('POST Run TDD: retorna 503 sem executor isolado e não altera o teste', async () => {
  accessAllowed = true;

  try {
    const req = createRequest({
      params: { id: 'teste-autorizado' },
    });

    const { res, result } = createResponse();
    const before = calls.tddUpdated;

    await XpController.runTddTest(req as any, res as any);

    assert.equal(result.statusCode, 503, JSON.stringify(result.body));
    assert.equal(calls.tddUpdated, before);
    assert.deepEqual(result.body, {
      success: false,
      message: 'Execução TDD indisponível: executor isolado ainda não habilitado.',
    });
  } finally {
    accessAllowed = false;
  }
});

test('POST Trigger CI: permite criar build para usuário autorizado', async () => {
  accessAllowed = true;

  try {
    const req = createRequest({
      body: {
        projectId: 'project-autorizado',
        branch: 'main',
      },
    });

    const { res, result } = createResponse();
    const countBefore = calls.ciCountQueried;
    const createdBefore = calls.ciCreated;

    await XpController.triggerCiBuild(req as any, res as any);

    assert.equal(result.statusCode, 201, JSON.stringify(result.body));
    assert.equal(calls.ciCountQueried, countBefore + 1);
    assert.equal(calls.ciCreated, createdBefore + 1);
    assert.deepEqual(result.body, {
      success: true,
      data: { build: {} },
    });
  } finally {
    accessAllowed = false;
  }
});

test('POST Pair Session: permite criar sessão para usuário autorizado', async () => {
  accessAllowed = true;

  try {
    const req = createRequest({
      body: {
        projectId: 'project-autorizado',
        driverId: 'driver-1',
        driverName: 'Driver Teste',
        navigatorId: 'navigator-1',
        navigatorName: 'Navigator Teste',
        taskTitle: 'Implementar funcionalidade',
        branchName: 'feat/teste',
      },
    });

    const { res, result } = createResponse();
    const membersBefore = calls.membersQueried;
    const sessionsBefore = calls.sessionCreated;

    await XpController.createPairSession(req as any, res as any);

    assert.equal(result.statusCode, 201, JSON.stringify(result.body));
    assert.equal(calls.membersQueried, membersBefore + 1);
    assert.equal(calls.sessionCreated, sessionsBefore + 1);
    assert.deepEqual(result.body, {
      success: true,
      data: { session: {} },
    });
  } finally {
    accessAllowed = false;
  }
});
