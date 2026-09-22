import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DB_FILE_PATH = path.resolve(process.cwd(), 'server', 'db', 'sprintforge_db.json');

// Interface definition for our persistent database store
export interface DatabaseSchema {
  users: any[];
  projects: any[];
  projectMembers: any[];
  projectInvites: any[];
  memberRemovalLogs: any[];
  tasks: any[];
  sprints: any[];
  dailyNotes: any[];
  retroCards: any[];
  planningPokerSessions: any[];
  chatMessages: any[];
  pairSessions: any[];
  tddTests: any[];
  ciBuilds: any[];
}

function getInitialSeedData(): DatabaseSchema {
  const hash123 = bcrypt.hashSync('123', 10);

  const users = [
    {
      id: 'user_admin_1',
      name: 'João Victor',
      email: 'joao@sprintforge.com',
      phone: '(11) 98888-7777',
      techArea: 'Engenharia Fullstack',
      passwordHash: hash123,
      createdAt: '2026-01-01T00:00:00.000Z',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'user_ana_2',
      name: 'Ana Silva',
      email: 'ana@sprintforge.com',
      phone: '(11) 97777-6666',
      techArea: 'Scrum Master / Agile Coach',
      passwordHash: hash123,
      createdAt: '2026-01-02T00:00:00.000Z',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'user_carlos_3',
      name: 'Carlos Mendes',
      email: 'carlos@sprintforge.com',
      phone: '(11) 96666-5555',
      techArea: 'DevOps / Cloud Infrastructure',
      passwordHash: hash123,
      createdAt: '2026-01-03T00:00:00.000Z',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'user_mariana_4',
      name: 'Mariana Costa',
      email: 'mariana@sprintforge.com',
      phone: '(11) 95555-4444',
      techArea: 'QA / Testes & Qualidade',
      passwordHash: hash123,
      createdAt: '2026-01-04T00:00:00.000Z',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    },
  ];

  const projects = [
    {
      id: 'proj_xp_1',
      name: 'ForgePay Core API',
      description: 'Gateway de pagamentos resiliente e crítico com foco em zero defeitos e testes automatizados intensivos.',
      adminId: 'user_admin_1',
      adminName: 'João Victor',
      adminEmail: 'joao@sprintforge.com',
      recommendedMethodology: 'XP',
      activeMethodology: 'XP',
      teamSize: 5,
      status: 'ACTIVE',
      tags: ['Fintech', 'Microserviços', 'Crítico'],
      deadline: '2026-12-31',
      createdAt: '2026-07-10T10:00:00.000Z',
      updatedAt: '2026-07-10T10:00:00.000Z',
    },
    {
      id: 'proj_scrum_1',
      name: 'Nexus E-Commerce App',
      description: 'Plataforma B2B de vendas omnichannel com lançamentos estruturados a cada 2 semanas.',
      adminId: 'user_admin_1',
      adminName: 'João Victor',
      adminEmail: 'joao@sprintforge.com',
      recommendedMethodology: 'SCRUM',
      activeMethodology: 'SCRUM',
      teamSize: 4,
      status: 'ACTIVE',
      tags: ['Mobile', 'React Native', 'B2B'],
      deadline: '2026-11-30',
      createdAt: '2026-06-01T10:00:00.000Z',
      updatedAt: '2026-06-01T10:00:00.000Z',
    },
    {
      id: 'proj_kanban_1',
      name: 'Cloud Operations & Support',
      description: 'Fluxo contínuo de suporte nível 3, sustentação e incidentes de infraestrutura.',
      adminId: 'user_admin_1',
      adminName: 'João Victor',
      adminEmail: 'joao@sprintforge.com',
      recommendedMethodology: 'KANBAN',
      activeMethodology: 'KANBAN',
      teamSize: 6,
      status: 'ACTIVE',
      tags: ['SRE', 'Suporte', 'DevOps'],
      deadline: null,
      createdAt: '2026-05-15T10:00:00.000Z',
      updatedAt: '2026-05-15T10:00:00.000Z',
    },
  ];

  const projectMembers = [
    { id: 'pm_1', projectId: 'proj_xp_1', userId: 'user_admin_1', name: 'João Victor', email: 'joao@sprintforge.com', role: 'ADMIN', techArea: 'Engenharia Fullstack', avatarUrl: users[0].avatarUrl, joinedAt: '2026-07-10T10:00:00.000Z' },
    { id: 'pm_2', projectId: 'proj_xp_1', userId: 'user_ana_2', name: 'Ana Silva', email: 'ana@sprintforge.com', role: 'MEMBER', techArea: 'Scrum Master / Agile Coach', avatarUrl: users[1].avatarUrl, joinedAt: '2026-07-11T10:00:00.000Z' },
    { id: 'pm_3', projectId: 'proj_xp_1', userId: 'user_carlos_3', name: 'Carlos Mendes', email: 'carlos@sprintforge.com', role: 'MEMBER', techArea: 'DevOps / Cloud Infrastructure', avatarUrl: users[2].avatarUrl, joinedAt: '2026-07-12T10:00:00.000Z' },
    { id: 'pm_4', projectId: 'proj_scrum_1', userId: 'user_admin_1', name: 'João Victor', email: 'joao@sprintforge.com', role: 'ADMIN', techArea: 'Engenharia Fullstack', avatarUrl: users[0].avatarUrl, joinedAt: '2026-06-01T10:00:00.000Z' },
    { id: 'pm_5', projectId: 'proj_scrum_1', userId: 'user_ana_2', name: 'Ana Silva', email: 'ana@sprintforge.com', role: 'MEMBER', techArea: 'Scrum Master / Agile Coach', avatarUrl: users[1].avatarUrl, joinedAt: '2026-06-02T10:00:00.000Z' },
    { id: 'pm_6', projectId: 'proj_scrum_1', userId: 'user_mariana_4', name: 'Mariana Costa', email: 'mariana@sprintforge.com', role: 'MEMBER', techArea: 'QA / Testes & Qualidade', avatarUrl: users[3].avatarUrl, joinedAt: '2026-06-03T10:00:00.000Z' },
    { id: 'pm_7', projectId: 'proj_kanban_1', userId: 'user_admin_1', name: 'João Victor', email: 'joao@sprintforge.com', role: 'ADMIN', techArea: 'Engenharia Fullstack', avatarUrl: users[0].avatarUrl, joinedAt: '2026-05-15T10:00:00.000Z' },
    { id: 'pm_8', projectId: 'proj_kanban_1', userId: 'user_carlos_3', name: 'Carlos Mendes', email: 'carlos@sprintforge.com', role: 'MEMBER', techArea: 'DevOps / Cloud Infrastructure', avatarUrl: users[2].avatarUrl, joinedAt: '2026-05-16T10:00:00.000Z' },
  ];

  const tasks = [
    {
      id: 'task_xp_1',
      projectId: 'proj_xp_1',
      title: 'Implementar idempotência no webhook PIX',
      description: 'Garantir que eventos duplicados do gateway não gerem estornos incorretos.',
      status: 'in_progress',
      priority: 'Alta',
      storyPoints: 5,
      assignees: ['João Victor', 'Ana Silva'],
      tags: ['TDD', 'Pair', 'PIX'],
      inBacklog: false,
      sprintId: null,
      createdAt: '2026-07-11T10:00:00.000Z',
      updatedAt: '2026-07-11T10:00:00.000Z',
    },
    {
      id: 'task_xp_2',
      projectId: 'proj_xp_1',
      title: 'Escrever suíte de testes unitários para cálculo de juros',
      description: 'Cobertura de testes para juros compostos seguindo ciclo Red-Green-Refactor.',
      status: 'done',
      priority: 'Média',
      storyPoints: 3,
      assignees: ['Carlos Mendes'],
      tags: ['TDD', 'Matemática'],
      inBacklog: false,
      sprintId: null,
      createdAt: '2026-07-10T10:00:00.000Z',
      updatedAt: '2026-07-10T10:00:00.000Z',
    },
    {
      id: 'task_xp_3',
      projectId: 'proj_xp_1',
      title: 'Refatorar middleware de autenticação mTLS',
      description: 'Simplificar camadas de verificação de certificados x509 entre serviços.',
      status: 'todo',
      priority: 'Crítica',
      storyPoints: 8,
      assignees: ['João Victor'],
      tags: ['Segurança', 'Refatoração'],
      inBacklog: false,
      sprintId: null,
      createdAt: '2026-07-12T10:00:00.000Z',
      updatedAt: '2026-07-12T10:00:00.000Z',
    },
    {
      id: 'task_scrum_1',
      projectId: 'proj_scrum_1',
      title: 'Desenvolver carrinho de compras e checkout B2B',
      description: 'Fluxo com seleção de múltiplos centros de distribuição e faturamento a prazo.',
      status: 'in_progress',
      priority: 'Alta',
      storyPoints: 8,
      assignees: ['João Victor', 'Ana Silva'],
      tags: ['Checkout', 'Core'],
      inBacklog: false,
      sprintId: 'sprint_scrum_1',
      createdAt: '2026-06-02T10:00:00.000Z',
      updatedAt: '2026-06-02T10:00:00.000Z',
    },
    {
      id: 'task_scrum_2',
      projectId: 'proj_scrum_1',
      title: 'Integração com cálculo de frete rodoviário',
      description: 'Conectar à API de cotação com fallback em caso de timeout.',
      status: 'todo',
      priority: 'Média',
      storyPoints: 5,
      assignees: ['Mariana Costa'],
      tags: ['Logística'],
      inBacklog: false,
      sprintId: 'sprint_scrum_1',
      createdAt: '2026-06-03T10:00:00.000Z',
      updatedAt: '2026-06-03T10:00:00.000Z',
    },
  ];

  const sprints = [
    {
      id: 'sprint_scrum_1',
      projectId: 'proj_scrum_1',
      name: 'Sprint 14: Checkout B2B & Fretes',
      goal: 'Entregar o fluxo completo de compra e cálculo de impostos para clientes corporativos.',
      startDate: '2026-08-15T00:00:00.000Z',
      endDate: '2026-08-29T23:59:59.000Z',
      status: 'ACTIVE',
      velocity: 28,
      createdAt: '2026-08-15T00:00:00.000Z',
      updatedAt: '2026-08-15T00:00:00.000Z',
    },
    {
      id: 'sprint_scrum_0',
      projectId: 'proj_scrum_1',
      name: 'Sprint 13: Catálogo e Busca Elastic',
      goal: 'Finalizar indexação de 50.000 SKUs e filtros facetados.',
      startDate: '2026-08-01T00:00:00.000Z',
      endDate: '2026-08-14T23:59:59.000Z',
      status: 'COMPLETED',
      velocity: 32,
      createdAt: '2026-08-01T00:00:00.000Z',
      updatedAt: '2026-08-14T23:59:59.000Z',
    },
  ];

  const dailyNotes = [
    {
      id: 'daily_1',
      projectId: 'proj_scrum_1',
      authorId: 'user_admin_1',
      author: { id: 'user_admin_1', name: 'João Victor', techArea: 'Engenharia Fullstack' },
      yesterday: 'Finalizei a estrutura do carrinho de compras e os seletores de endereço.',
      today: 'Vou conectar o cálculo de frete e criar testes unitários para tributos.',
      blockers: null,
      date: '2026-08-20T10:00:00.000Z',
      createdAt: '2026-08-20T10:00:00.000Z',
    },
    {
      id: 'daily_2',
      projectId: 'proj_scrum_1',
      authorId: 'user_ana_2',
      author: { id: 'user_ana_2', name: 'Ana Silva', techArea: 'Scrum Master / Agile Coach' },
      yesterday: 'Alinhei os critérios de aceitação com o PO e atualizei o burndown.',
      today: 'Facilitarei o refinamento do backlog e a retrospectiva da Sprint.',
      blockers: null,
      date: '2026-08-20T10:15:00.000Z',
      createdAt: '2026-08-20T10:15:00.000Z',
    },
  ];

  const retroCards = [
    {
      id: 'retro_1',
      projectId: 'proj_scrum_1',
      sprintId: 'sprint_scrum_1',
      type: 'WENT_WELL',
      content: 'A comunicação assíncrona no chat do projeto agilizou a resolução de dúvidas de regra de negócio.',
      votes: 3,
      voters: ['user_admin_1', 'user_ana_2', 'user_mariana_4'],
      authorId: 'user_admin_1',
      author: { id: 'user_admin_1', name: 'João Victor' },
      createdAt: '2026-08-20T14:00:00.000Z',
    },
    {
      id: 'retro_2',
      projectId: 'proj_scrum_1',
      sprintId: 'sprint_scrum_1',
      type: 'TO_IMPROVE',
      content: 'Alguns story points no Planning Poker demoraram muito para convergir. Precisamos focar no critério de pronto (DoD).',
      votes: 2,
      voters: ['user_ana_2', 'user_mariana_4'],
      authorId: 'user_ana_2',
      author: { id: 'user_ana_2', name: 'Ana Silva' },
      createdAt: '2026-08-20T14:10:00.000Z',
    },
    {
      id: 'retro_3',
      projectId: 'proj_scrum_1',
      sprintId: 'sprint_scrum_1',
      type: 'ACTION_ITEMS',
      content: 'Criar checklist padrão de Definition of Done direto no template de novas tarefas.',
      votes: 4,
      voters: ['user_admin_1', 'user_ana_2', 'user_carlos_3', 'user_mariana_4'],
      authorId: 'user_admin_1',
      author: { id: 'user_admin_1', name: 'João Victor' },
      createdAt: '2026-08-20T14:20:00.000Z',
    },
  ];

  const chatMessages = [
    {
      id: 'chat_init_1',
      projectId: 'proj_xp_1',
      senderId: 'user_admin_1',
      senderName: 'João Victor',
      senderTechArea: 'Engenharia Fullstack',
      content: 'Bem-vindos ao projeto ForgePay Core API! Vamos focar na cobertura de TDD e deploys contínuos.',
      isSystem: false,
      createdAt: '2026-07-10T10:05:00.000Z',
    },
    {
      id: 'chat_init_2',
      projectId: 'proj_scrum_1',
      senderId: 'user_admin_1',
      senderName: 'João Victor',
      senderTechArea: 'Engenharia Fullstack',
      content: 'Projeto Nexus E-Commerce iniciado. Sprints quinzenais ativas.',
      isSystem: false,
      createdAt: '2026-06-01T10:05:00.000Z',
    },
    {
      id: 'chat_init_3',
      projectId: 'proj_kanban_1',
      senderId: 'user_admin_1',
      senderName: 'João Victor',
      senderTechArea: 'Engenharia Fullstack',
      content: 'Quadro Kanban de operações configurado com limites WIP estritos.',
      isSystem: false,
      createdAt: '2026-05-15T10:05:00.000Z',
    },
  ];

  const pairSessions = [
    {
      id: 'pair_1',
      projectId: 'proj_xp_1',
      driverId: 'user_admin_1',
      driverName: 'João Victor',
      navigatorId: 'user_ana_2',
      navigatorName: 'Ana Silva',
      taskTitle: 'Implementar idempotência no webhook PIX',
      branchName: 'feature/pix-idempotency',
      status: 'COMPLETED',
      startedAt: '2026-07-11T14:00:00.000Z',
      durationMinutes: 50,
    },
  ];

  const tddTests = [
    {
      id: 'tdd_1',
      projectId: 'proj_xp_1',
      name: 'deve rejeitar transação PIX com hash repetido (409 Conflict)',
      file: 'src/services/pix.spec.ts',
      status: 'PASS',
      durationMs: 14,
      lastRun: '2026-07-11T15:20:00.000Z',
    },
    {
      id: 'tdd_2',
      projectId: 'proj_xp_1',
      name: 'deve calcular juros pró-rata de atraso de boleto',
      file: 'src/services/interest.spec.ts',
      status: 'PASS',
      durationMs: 8,
      lastRun: '2026-07-10T16:00:00.000Z',
    },
    {
      id: 'tdd_3',
      projectId: 'proj_xp_1',
      name: 'deve validar expiração do certificado mTLS do parceiro',
      file: 'src/middleware/mtls.spec.ts',
      status: 'FAIL',
      durationMs: 22,
      lastRun: '2026-07-12T09:10:00.000Z',
    },
  ];

  const ciBuilds = [
    {
      id: 'ci_1',
      projectId: 'proj_xp_1',
      buildNumber: 142,
      commitHash: 'a7f39b2',
      commitMessage: 'feat(pix): add idempotency key check middleware',
      branch: 'main',
      author: 'João Victor',
      status: 'SUCCESS',
      testsCount: 48,
      failedCount: 0,
      createdAt: '2026-07-11T16:00:00.000Z',
    },
    {
      id: 'ci_2',
      projectId: 'proj_xp_1',
      buildNumber: 143,
      commitHash: 'e4c8109',
      commitMessage: 'test(mtls): add test case for revoked cert',
      branch: 'feature/mtls-auth',
      author: 'João Victor',
      status: 'FAILED',
      testsCount: 49,
      failedCount: 1,
      createdAt: '2026-07-12T09:15:00.000Z',
    },
  ];

  return {
    users,
    projects,
    projectMembers,
    projectInvites: [],
    memberRemovalLogs: [],
    tasks,
    sprints,
    dailyNotes,
    retroCards,
    planningPokerSessions: [],
    chatMessages,
    pairSessions,
    tddTests,
    ciBuilds,
  };
}

class JsonDatabaseStore {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE_PATH)) {
        const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.users)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[Server DB]: Could not read existing DB file. Re-initializing seed.', e);
    }

    const seed = getInitialSeedData();
    this.persist(seed);
    return seed;
  }

  private persist(newData?: DatabaseSchema): void {
    try {
      const toSave = newData || this.data;
      const dir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(toSave, null, 2), 'utf-8');
    } catch (e) {
      console.error('[Server DB Save Error]:', e);
    }
  }

  // --- Entity Model Helpers ---
  get user() {
    return {
      findUnique: async ({ where, select }: { where: { id?: string; email?: string }; select?: any }) => {
        let user: any = null;
        if (where.id) {
          user = this.data.users.find((u) => u.id === where.id) || null;
        } else if (where.email) {
          const norm = where.email.trim().toLowerCase();
          user = this.data.users.find((u) => u.email.toLowerCase() === norm) || null;
        }
        if (!user) return null;
        if (select) {
          const res: any = {};
          for (const key of Object.keys(select)) {
            if (select[key]) res[key] = user[key];
          }
          return res;
        }
        return user;
      },
      findFirst: async ({ where, select }: { where?: any; select?: any } = {}) => {
        let user = this.data.users[0] || null;
        if (where) {
          user = this.data.users.find((u) => {
            if (where.email && u.email.toLowerCase() !== where.email.toLowerCase()) return false;
            if (where.id && u.id !== where.id) return false;
            return true;
          }) || null;
        }
        if (!user) return null;
        if (select) {
          const res: any = {};
          for (const key of Object.keys(select)) {
            if (select[key]) res[key] = user[key];
          }
          return res;
        }
        return user;
      },
      findMany: async ({ where, select }: { where?: any; select?: any } = {}) => {
        return this.data.users.map((u) => {
          if (select) {
            const res: any = {};
            for (const key of Object.keys(select)) {
              if (select[key]) res[key] = u[key];
            }
            return res;
          }
          return {
            id: u.id,
            name: u.name,
            email: u.email,
            phone: u.phone,
            techArea: u.techArea,
            avatarUrl: u.avatarUrl,
            createdAt: u.createdAt,
          };
        });
      },
      create: async ({ data, select }: { data: any; select?: any }) => {
        const newUser = {
          id: data.id || `user_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          name: data.name,
          email: data.email.trim().toLowerCase(),
          phone: data.phone || null,
          techArea: data.techArea || 'Engenharia Fullstack',
          passwordHash: data.passwordHash,
          avatarUrl: data.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        this.data.users.push(newUser);
        this.persist();
        if (select) {
          const res: any = {};
          for (const key of Object.keys(select)) {
            if (select[key]) res[key] = (newUser as any)[key];
          }
          return res;
        }
        return newUser;
      },
      update: async ({ where, data, select }: { where: { id: string }; data: any; select?: any }) => {
        const idx = this.data.users.findIndex((u) => u.id === where.id);
        if (idx === -1) throw new Error('Usuário não encontrado');
        const updated = {
          ...this.data.users[idx],
          ...data,
          updatedAt: new Date().toISOString(),
        };
        this.data.users[idx] = updated;
        this.persist();
        if (select) {
          const res: any = {};
          for (const key of Object.keys(select)) {
            if (select[key]) res[key] = updated[key];
          }
          return res;
        }
        return updated;
      },
    };
  }

  get project() {
    return {
      findMany: async ({ where, include }: { where?: any; include?: any; orderBy?: any } = {}) => {
        let results = [...this.data.projects];

        if (where?.OR) {
          results = results.filter((p) => {
            return where.OR.some((condition: any) => {
              if (condition.adminId && p.adminId === condition.adminId) return true;
              if (condition.adminEmail && p.adminEmail?.toLowerCase() === condition.adminEmail.toLowerCase()) return true;
              if (condition.members?.some) {
                const someCond = condition.members.some;
                const members = this.data.projectMembers.filter((m) => m.projectId === p.id);
                return members.some((m) => {
                  if (someCond.OR) {
                    return someCond.OR.some((c: any) => {
                      if (c.userId && m.userId === c.userId) return true;
                      if (c.email && m.email?.toLowerCase() === c.email.toLowerCase()) return true;
                      return false;
                    });
                  }
                  return false;
                });
              }
              return false;
            });
          });
        }

        if (include) {
          return results.map((p) => this.hydrateProject(p));
        }
        return results;
      },
      findUnique: async ({ where, include }: { where: { id: string }; include?: any }) => {
        const p = this.data.projects.find((proj) => proj.id === where.id);
        if (!p) return null;
        if (include) {
          return this.hydrateProject(p);
        }
        return p;
      },
      create: async ({ data, include }: { data: any; include?: any }) => {
        const id = data.id || `proj_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
        const newProj = {
          id,
          name: data.name,
          description: data.description || '',
          adminId: data.adminId,
          adminName: data.adminName || 'Admin',
          adminEmail: data.adminEmail || '',
          recommendedMethodology: data.recommendedMethodology || data.activeMethodology || 'XP',
          activeMethodology: data.activeMethodology || 'XP',
          teamSize: data.teamSize || 6,
          status: data.status || 'ACTIVE',
          tags: data.tags || [],
          deadline: data.deadline || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        this.data.projects.unshift(newProj);

        // If nested members created
        if (data.members?.create) {
          const membersToCreate = Array.isArray(data.members.create) ? data.members.create : [data.members.create];
          for (const m of membersToCreate) {
            this.data.projectMembers.push({
              id: `pm_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
              projectId: id,
              userId: m.userId,
              name: m.name,
              email: m.email,
              role: m.role || 'MEMBER',
              techArea: m.techArea || 'Engenharia',
              avatarUrl: m.avatarUrl || null,
              joinedAt: new Date().toISOString(),
            });
          }
        }

        this.persist();
        return include ? this.hydrateProject(newProj) : newProj;
      },
      update: async ({ where, data }: { where: { id: string }; data: any }) => {
        const idx = this.data.projects.findIndex((p) => p.id === where.id);
        if (idx === -1) throw new Error('Projeto não encontrado');
        const updated = {
          ...this.data.projects[idx],
          ...data,
          updatedAt: new Date().toISOString(),
        };
        this.data.projects[idx] = updated;
        this.persist();
        return updated;
      },
      delete: async ({ where }: { where: { id: string } }) => {
        this.data.projects = this.data.projects.filter((p) => p.id !== where.id);
        this.data.tasks = this.data.tasks.filter((t) => t.projectId !== where.id);
        this.data.projectMembers = this.data.projectMembers.filter((m) => m.projectId !== where.id);
        this.data.sprints = this.data.sprints.filter((s) => s.projectId !== where.id);
        this.data.chatMessages = this.data.chatMessages.filter((c) => c.projectId !== where.id);
        this.data.dailyNotes = this.data.dailyNotes.filter((d) => d.projectId !== where.id);
        this.data.retroCards = this.data.retroCards.filter((r) => r.projectId !== where.id);
        this.persist();
        return { success: true };
      },
    };
  }

  private hydrateProject(p: any) {
    return {
      ...p,
      members: this.data.projectMembers.filter((m) => m.projectId === p.id),
      invites: this.data.projectInvites.filter((i) => i.projectId === p.id),
      removalLogs: this.data.memberRemovalLogs.filter((r) => r.projectId === p.id),
      tasks: this.data.tasks.filter((t) => t.projectId === p.id),
      sprints: this.data.sprints.filter((s) => s.projectId === p.id),
    };
  }

  get projectMember() {
    return {
      findMany: async ({ where }: { where?: any } = {}) => {
        let results = [...this.data.projectMembers];
        if (where?.projectId) results = results.filter((m) => m.projectId === where.projectId);
        if (where?.userId) results = results.filter((m) => m.userId === where.userId);
        return results;
      },
      create: async ({ data }: { data: any }) => {
        const newMember = {
          id: data.id || `pm_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          projectId: data.projectId,
          userId: data.userId,
          name: data.name,
          email: data.email,
          role: data.role || 'MEMBER',
          techArea: data.techArea || 'Engenharia',
          avatarUrl: data.avatarUrl || null,
          joinedAt: new Date().toISOString(),
        };
        this.data.projectMembers.push(newMember);
        this.persist();
        return newMember;
      },
      updateMany: async ({ where, data }: { where: { userId?: string; projectId?: string }; data: any }) => {
        let count = 0;
        this.data.projectMembers = this.data.projectMembers.map((m) => {
          if (where.userId && m.userId === where.userId) {
            count++;
            return { ...m, ...data };
          }
          return m;
        });
        this.persist();
        return { count };
      },
      delete: async ({ where }: { where: { id: string } }) => {
        this.data.projectMembers = this.data.projectMembers.filter((m) => m.id !== where.id);
        this.persist();
        return { success: true };
      },
    };
  }

  get projectInvite() {
    return {
      create: async ({ data }: { data: any }) => {
        const invite = {
          id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          projectId: data.projectId,
          invitedEmail: data.invitedEmail.toLowerCase().trim(),
          role: data.role || 'MEMBER',
          inviteCode: data.inviteCode || `SF-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
          status: data.status || 'PENDING',
          createdAt: new Date().toISOString(),
          expiresAt: data.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        };
        this.data.projectInvites.push(invite);
        this.persist();
        return invite;
      },
      findUnique: async ({ where, include }: { where: { id?: string; inviteCode?: string }; include?: any }) => {
        let inv: any = null;
        if (where.inviteCode) {
          inv = this.data.projectInvites.find((i) => i.inviteCode === where.inviteCode);
        } else if (where.id) {
          inv = this.data.projectInvites.find((i) => i.id === where.id) || null;
        }
        if (!inv) return null;
        if (include?.project || where.inviteCode) {
          const project = this.data.projects.find((p) => p.id === inv.projectId);
          return { ...inv, project };
        }
        return inv;
      },
      findMany: async ({ where, include, orderBy }: { where?: any; include?: any; orderBy?: any } = {}) => {
        let list = [...this.data.projectInvites];
        if (where?.invitedEmail) {
          list = list.filter((i) => i.invitedEmail.toLowerCase() === where.invitedEmail.toLowerCase());
        }
        if (where?.status) {
          list = list.filter((i) => i.status === where.status);
        }
        if (include?.project) {
          list = list.map((inv) => ({
            ...inv,
            project: this.data.projects.find((p) => p.id === inv.projectId),
          }));
        }
        return list;
      },
      update: async ({ where, data }: { where: { id: string }; data: any }) => {
        const idx = this.data.projectInvites.findIndex((i) => i.id === where.id);
        if (idx === -1) throw new Error('Convite não encontrado');
        this.data.projectInvites[idx] = { ...this.data.projectInvites[idx], ...data };
        this.persist();
        return this.data.projectInvites[idx];
      },
    };
  }

  get memberRemovalLog() {
    return {
      create: async ({ data }: { data: any }) => {
        const log = {
          id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          ...data,
          removedAt: new Date().toISOString(),
        };
        this.data.memberRemovalLogs.push(log);
        this.persist();
        return log;
      },
    };
  }

  get task() {
    return {
      findMany: async ({ where }: { where?: any; orderBy?: any } = {}) => {
        let results = [...this.data.tasks];
        if (where?.projectId) {
          results = results.filter((t) => t.projectId === where.projectId);
        }
        if (where?.sprintId) {
          results = results.filter((t) => t.sprintId === where.sprintId);
        }
        return results;
      },
      findUnique: async ({ where }: { where: { id: string } }) => {
        return this.data.tasks.find((t) => t.id === where.id) || null;
      },
      create: async ({ data }: { data: any }) => {
        const newTask = {
          id: data.id || `task_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          projectId: data.projectId,
          title: data.title,
          description: data.description || '',
          status: data.status || 'todo',
          priority: data.priority || 'Média',
          storyPoints: data.storyPoints || 2,
          sprintId: data.sprintId || null,
          assignees: data.assignees || [],
          tags: data.tags || [],
          inBacklog: Boolean(data.inBacklog),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        this.data.tasks.unshift(newTask);
        this.persist();
        return newTask;
      },
      update: async ({ where, data }: { where: { id: string }; data: any }) => {
        const idx = this.data.tasks.findIndex((t) => t.id === where.id);
        if (idx === -1) throw new Error('Tarefa não encontrada');
        const updated = {
          ...this.data.tasks[idx],
          ...data,
          updatedAt: new Date().toISOString(),
        };
        this.data.tasks[idx] = updated;
        this.persist();
        return updated;
      },
      delete: async ({ where }: { where: { id: string } }) => {
        this.data.tasks = this.data.tasks.filter((t) => t.id !== where.id);
        this.persist();
        return { success: true };
      },
    };
  }

  get sprint() {
    return {
      findMany: async ({ where, include, orderBy }: { where?: any; include?: any; orderBy?: any } = {}) => {
        let results = [...this.data.sprints];
        if (where?.projectId) {
          results = results.filter((s) => s.projectId === where.projectId);
        }
        if (include?.tasks) {
          results = results.map((s) => ({
            ...s,
            tasks: this.data.tasks.filter((t) => t.sprintId === s.id),
          }));
        }
        return results;
      },
      findUnique: async ({ where }: { where: { id: string } }) => {
        return this.data.sprints.find((s) => s.id === where.id) || null;
      },
      create: async ({ data }: { data: any }) => {
        const newSprint = {
          id: data.id || `sprint_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          projectId: data.projectId,
          name: data.name,
          goal: data.goal || '',
          startDate: data.startDate,
          endDate: data.endDate,
          status: data.status || 'PLANNED',
          velocity: data.velocity || 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        this.data.sprints.unshift(newSprint);
        this.persist();
        return newSprint;
      },
      update: async ({ where, data }: { where: { id: string }; data: any }) => {
        const idx = this.data.sprints.findIndex((s) => s.id === where.id);
        if (idx === -1) throw new Error('Sprint não encontrada');
        const updated = {
          ...this.data.sprints[idx],
          ...data,
          updatedAt: new Date().toISOString(),
        };
        this.data.sprints[idx] = updated;
        this.persist();
        return updated;
      },
    };
  }

  get dailyNote() {
    return {
      findMany: async ({ where, include, orderBy }: { where?: any; include?: any; orderBy?: any } = {}) => {
        let results = [...this.data.dailyNotes];
        if (where?.projectId) {
          results = results.filter((d) => d.projectId === where.projectId);
        }
        if (include?.author) {
          results = results.map((d) => {
            const author = this.data.users.find((u) => u.id === d.authorId) || d.author;
            return {
              ...d,
              author: author ? { id: author.id, name: author.name, techArea: author.techArea } : null,
            };
          });
        }
        return results;
      },
      create: async ({ data }: { data: any }) => {
        const author = this.data.users.find((u) => u.id === data.authorId);
        const newNote = {
          id: data.id || `daily_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          projectId: data.projectId,
          authorId: data.authorId,
          author: author ? { id: author.id, name: author.name, techArea: author.techArea } : null,
          yesterday: data.yesterday,
          today: data.today,
          blockers: data.blockers || null,
          date: data.date || new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };
        this.data.dailyNotes.unshift(newNote);
        this.persist();
        return newNote;
      },
      delete: async ({ where }: { where: { id: string } }) => {
        this.data.dailyNotes = this.data.dailyNotes.filter((d) => d.id !== where.id);
        this.persist();
        return { success: true };
      },
    };
  }

  get retroCard() {
    return {
      findMany: async ({ where, include, orderBy }: { where?: any; include?: any; orderBy?: any } = {}) => {
        let results = [...this.data.retroCards];
        if (where?.projectId) {
          results = results.filter((r) => r.projectId === where.projectId);
        }
        if (include?.author) {
          results = results.map((r) => {
            const author = this.data.users.find((u) => u.id === r.authorId) || r.author;
            return {
              ...r,
              author: author ? { id: author.id, name: author.name } : null,
            };
          });
        }
        return results;
      },
      create: async ({ data }: { data: any }) => {
        const author = this.data.users.find((u) => u.id === data.authorId);
        const newCard = {
          id: data.id || `retro_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          projectId: data.projectId,
          sprintId: data.sprintId || null,
          type: data.type,
          content: data.content,
          votes: 0,
          voters: [],
          authorId: data.authorId,
          author: author ? { id: author.id, name: author.name } : null,
          createdAt: data.createdAt || new Date().toISOString(),
        };
        this.data.retroCards.unshift(newCard);
        this.persist();
        return newCard;
      },
      update: async ({ where, data }: { where: { id: string }; data: any }) => {
        const idx = this.data.retroCards.findIndex((r) => r.id === where.id);
        if (idx === -1) throw new Error('Cartão de retrospectiva não encontrado');
        const updated = {
          ...this.data.retroCards[idx],
          ...data,
        };
        this.data.retroCards[idx] = updated;
        this.persist();
        return updated;
      },
      delete: async ({ where }: { where: { id: string } }) => {
        this.data.retroCards = this.data.retroCards.filter((r) => r.id !== where.id);
        this.persist();
        return { success: true };
      },
    };
  }

  get planningPokerSession() {
    return {
      findFirst: async ({ where }: { where?: any } = {}) => {
        if (!where) return this.data.planningPokerSessions[0] || null;
        return this.data.planningPokerSessions.find((s) => {
          if (where.projectId && s.projectId !== where.projectId) return false;
          if (where.active !== undefined && s.active !== where.active) return false;
          return true;
        }) || null;
      },
      create: async ({ data }: { data: any }) => {
        const newSession = {
          id: data.id || `poker_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          ...data,
          createdAt: new Date().toISOString(),
        };
        this.data.planningPokerSessions.push(newSession);
        this.persist();
        return newSession;
      },
      update: async ({ where, data }: { where: { id: string }; data: any }) => {
        const idx = this.data.planningPokerSessions.findIndex((s) => s.id === where.id);
        if (idx === -1) throw new Error('Sessão de poker não encontrada');
        const updated = {
          ...this.data.planningPokerSessions[idx],
          ...data,
        };
        this.data.planningPokerSessions[idx] = updated;
        this.persist();
        return updated;
      },
    };
  }

  get chatMessage() {
    return {
      findMany: async ({ where, orderBy }: { where?: any; orderBy?: any } = {}) => {
        let results = [...this.data.chatMessages];
        if (where?.projectId) {
          results = results.filter((c) => c.projectId === where.projectId);
        }
        return results;
      },
      create: async ({ data }: { data: any }) => {
        const newMsg = {
          id: data.id || `chat_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          projectId: data.projectId,
          senderId: data.senderId,
          senderName: data.senderName,
          senderTechArea: data.senderTechArea || 'Engenharia',
          content: data.content,
          isSystem: Boolean(data.isSystem),
          createdAt: new Date().toISOString(),
        };
        this.data.chatMessages.push(newMsg);
        this.persist();
        return newMsg;
      },
    };
  }

  get pairSession() {
    return {
      findMany: async ({ where }: { where?: any; orderBy?: any } = {}) => {
        let results = [...this.data.pairSessions];
        if (where?.projectId) {
          results = results.filter((p) => p.projectId === where.projectId);
        }
        return results;
      },
      create: async ({ data }: { data: any }) => {
        const newSession = {
          id: data.id || `pair_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          ...data,
          startedAt: new Date().toISOString(),
        };
        this.data.pairSessions.unshift(newSession);
        this.persist();
        return newSession;
      },
    };
  }

  get tddTest() {
    return {
      findMany: async ({ where }: { where?: any; orderBy?: any } = {}) => {
        let results = [...this.data.tddTests];
        if (where?.projectId) {
          results = results.filter((t) => t.projectId === where.projectId);
        }
        return results;
      },
      update: async ({ where, data }: { where: { id: string }; data: any }) => {
        const idx = this.data.tddTests.findIndex((t) => t.id === where.id);
        if (idx === -1) throw new Error('Teste TDD não encontrado');
        const updated = {
          ...this.data.tddTests[idx],
          ...data,
        };
        this.data.tddTests[idx] = updated;
        this.persist();
        return updated;
      },
    };
  }

  get ciBuild() {
    return {
      findMany: async ({ where }: { where?: any; orderBy?: any } = {}) => {
        let results = [...this.data.ciBuilds];
        if (where?.projectId) {
          results = results.filter((b) => b.projectId === where.projectId);
        }
        return results;
      },
      create: async ({ data }: { data: any }) => {
        const newBuild = {
          id: data.id || `ci_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          buildNumber: this.data.ciBuilds.length + 140,
          ...data,
          createdAt: new Date().toISOString(),
        };
        this.data.ciBuilds.unshift(newBuild);
        this.persist();
        return newBuild;
      },
    };
  }

  async $transaction(operations: any[] | ((tx: any) => Promise<any>)) {
    if (typeof operations === 'function') {
      return operations(this);
    }
    const results = [];
    for (const op of operations) {
      results.push(await op);
    }
    return results;
  }
}

// Singleton database instance
export const prisma = new JsonDatabaseStore();
export default prisma;
