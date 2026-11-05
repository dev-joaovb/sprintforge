import test from 'node:test';
import assert from 'node:assert/strict';
import {
  checkXpProjectAccess,
  type ProjectAccessClient,
} from '../services/xp-access.service';

type ProjectRecord = {
  id: string;
  adminId: string;
  adminEmail: string;
  members: Array<{ userId: string; email: string }>;
};

const project: ProjectRecord = {
  id: 'project-1',
  adminId: 'admin-1',
  adminEmail: 'admin@example.com',
  members: [
    { userId: 'member-1', email: 'member@example.com' },
  ],
};

function createMockDb(): ProjectAccessClient {
  return {
    project: {
      async findFirst(args) {
        const where = args.where;
        if (where.id !== project.id) return null;

        const conditions = where.OR ?? [];

        const authorized = conditions.some((condition) => {
          if (condition.adminId === project.adminId) return true;
          if (condition.adminEmail === project.adminEmail) return true;

          const memberFilter = condition.members;
          if (!memberFilter || typeof memberFilter !== 'object') return false;

          const some = memberFilter.some;
          if (!some || typeof some !== 'object') return false;

          return project.members.some((member) =>
            (some.OR ?? []).some(
              (rule) =>
                rule.userId === member.userId ||
                rule.email === member.email
            )
          );
        });

        return authorized ? { id: project.id } : null;
      },
    },
  };
}

const db = createMockDb();

test('permite acesso ao administrador pelo ID', async () => {
  const result = await checkXpProjectAccess(
    project.id,
    { id: 'admin-1', email: 'admin@example.com', name: 'Administrador' },
    db
  );
  assert.equal(result, true);
});

test('permite acesso ao administrador pelo e-mail', async () => {
  const result = await checkXpProjectAccess(
    project.id,
    { id: 'other-id', email: 'admin@example.com', name: 'Outro Usuário' },
    db
  );
  assert.equal(result, true);
});

test('permite acesso ao membro pelo ID', async () => {
  const result = await checkXpProjectAccess(
    project.id,
    { id: 'member-1', email: 'other@example.com', name: 'Membro' },
    db
  );
  assert.equal(result, true);
});

test('permite acesso ao membro pelo e-mail', async () => {
  const result = await checkXpProjectAccess(
    project.id,
    { id: 'other-id', email: 'member@example.com', name: 'Outro Usuário' },
    db
  );
  assert.equal(result, true);
});

test('nega acesso a usuário externo', async () => {
  const result = await checkXpProjectAccess(
    project.id,
    { id: 'external-1', email: 'external@example.com', name: 'Usuário Externo' },
    db
  );
  assert.equal(result, false);
});

test('nega acesso a projeto diferente', async () => {
  const result = await checkXpProjectAccess(
    'project-2',
    { id: 'admin-1', email: 'admin@example.com', name: 'Administrador' },
    db
  );
  assert.equal(result, false);
});
