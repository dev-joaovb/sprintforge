import prisma from '../db/prisma';
import { hasXpProjectAccess } from './xp-access.prisma';
import type { AuthPayload } from '../middleware/auth';

export class TddError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'TddError';
  }
}

const MAX_NAME = 200;
const MAX_FEATURE = 200;
const MAX_SNIPPET = 20000;

function requiredText(value: unknown, label: string, max: number): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new TddError(400, `${label} é obrigatório.`);
  }

  const normalized = value.trim();

  if (normalized.length > max) {
    throw new TddError(400, `${label} excede ${max} caracteres.`);
  }

  return normalized;
}

export async function createTddTest(
  input: {
    projectId?: unknown;
    featureName?: unknown;
    testName?: unknown;
    codeSnippet?: unknown;
  },
  user: AuthPayload
) {
  const projectId = requiredText(input.projectId, 'Projeto', 100);
  const featureName = requiredText(input.featureName, 'Funcionalidade', MAX_FEATURE);
  const testName = requiredText(input.testName, 'Nome do teste', MAX_NAME);

  if (
    input.codeSnippet !== undefined &&
    typeof input.codeSnippet !== 'string'
  ) {
    throw new TddError(400, 'Snippet inválido.');
  }

  const codeSnippet = typeof input.codeSnippet === 'string'
    ? input.codeSnippet.trim()
    : '';

  if (codeSnippet.length > MAX_SNIPPET) {
    throw new TddError(400, 'Snippet excede 20000 caracteres.');
  }

  if (!(await hasXpProjectAccess(projectId, user))) {
    throw new TddError(403, 'Sem acesso ao projeto.');
  }

  return prisma.tddTest.create({
    data: {
      projectId,
      featureName,
      name: testName,
      codeSnippet: codeSnippet || null,
      cycleStatus: 'RED',
    },
  });
}

export async function advanceTddCycle(
  id: string,
  user: AuthPayload
) {
  const testId = requiredText(id, 'Identificador do teste', 100);

  const test = await prisma.tddTest.findUnique({
    where: { id: testId },
  });

  if (!test) {
    throw new TddError(404, 'Teste TDD não encontrado.');
  }

  if (!(await hasXpProjectAccess(test.projectId, user))) {
    throw new TddError(403, 'Sem acesso ao projeto.');
  }

  const nextStatus = {
    RED: 'GREEN',
    GREEN: 'REFACTORED',
    REFACTORED: 'RED',
  } as const;

  const updated = await prisma.tddTest.updateMany({
    where: {
      id: testId,
      cycleStatus: test.cycleStatus,
    },
    data: {
      cycleStatus: nextStatus[test.cycleStatus],
    },
  });

  if (updated.count !== 1) {
    throw new TddError(
      409,
      'O estado do teste foi alterado por outra operação. Atualize os dados e tente novamente.'
    );
  }

  const result = await prisma.tddTest.findUnique({
    where: { id: testId },
  });

  if (!result) {
    throw new TddError(404, 'Teste TDD não encontrado.');
  }

  return result;
}
