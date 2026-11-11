import prisma from '../db/prisma';
import { hasXpProjectAccess } from './xp-access.prisma';
import type { AuthPayload } from '../middleware/auth';
import { TddError } from './xp-tdd.prisma';
import {
  DisabledTddExecutor,
  type TddExecutor,
  type TddExecutionResult,
} from './xp-tdd-executor';

const MAX_ERROR_LENGTH = 4000;

function normalizeResult(result: TddExecutionResult): TddExecutionResult {
  if (
    !['PASS', 'FAIL', 'ERROR', 'TIMEOUT'].includes(result.status) ||
    !Number.isFinite(result.executionTimeMs) ||
    result.executionTimeMs < 0 ||
    !Number.isSafeInteger(result.executionTimeMs)
  ) {
    throw new Error('Resultado inválido retornado pelo executor TDD.');
  }

  return {
    status: result.status,
    executionTimeMs: result.executionTimeMs,
    error: result.error?.slice(0, MAX_ERROR_LENGTH) ?? null,
  };
}

export async function runTddExecution(
  id: string,
  user: AuthPayload,
  executor: TddExecutor = new DisabledTddExecutor()
) {
  if (!id?.trim()) {
    throw new TddError(400, 'Identificador do teste obrigatório.');
  }

  const test = await prisma.tddTest.findUnique({
    where: { id },
  });

  if (!test) {
    throw new TddError(404, 'Teste TDD não encontrado.');
  }

  if (!(await hasXpProjectAccess(test.projectId, user))) {
    throw new TddError(403, 'Sem acesso ao projeto.');
  }

  if (!test.codeSnippet?.trim()) {
    throw new TddError(400, 'O teste não possui código para execução.');
  }

  if (executor instanceof DisabledTddExecutor) {
    throw new TddError(
      503,
      'Execução TDD indisponível: ambiente isolado não configurado.'
    );
  }

  const claimed = await prisma.tddTest.updateMany({
    where: {
      id,
      status: { not: 'RUNNING' },
    },
    data: {
      status: 'RUNNING',
      executionError: null,
    },
  });

  if (claimed.count !== 1) {
    throw new TddError(409, 'Este teste já está em execução.');
  }

  let result: TddExecutionResult;

  try {
    result = normalizeResult(
      await executor.execute(test.codeSnippet)
    );
  } catch {
    result = {
      status: 'ERROR',
      executionTimeMs: 0,
      error: 'Falha interna no executor TDD.',
    };
  }

  const updated = await prisma.tddTest.updateMany({
    where: {
      id,
      status: 'RUNNING',
    },
    data: {
      status: result.status,
      executionTimeMs: result.executionTimeMs,
      executionError: result.error,
      lastRun: new Date(),
    },
  });

  if (updated.count !== 1) {
    throw new TddError(
      409,
      'O estado da execução foi alterado durante o processamento.'
    );
  }

  return prisma.tddTest.findUnique({
    where: { id },
  });
}
