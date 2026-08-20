export type Methodology = 'XP' | 'SCRUM' | 'KANBAN';

export type TaskPriority = 'Baixa' | 'Média' | 'Alta' | 'Urgente';

export type KanbanColumnId = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: KanbanColumnId;
  priority: TaskPriority;
  storyPoints?: number;
  assignees: string[]; // Member IDs
  tags: string[];
  createdAt: string;
  startDate?: string;
  completedAt?: string;
  
  // Specific to XP TDD / Pair
  pairMembers?: string[];
  tddStatus?: 'RED' | 'GREEN' | 'REFACTORED';
  tddTestsCount?: { total: number; passing: number };

  // Specific to Scrum
  sprintId?: string | null;
  inBacklog?: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

export interface DiagnosticAnswer {
  questionId: string;
  selectedOptionIndex: number;
}

export interface DiagnosticResult {
  xpScore: number; // 0 - 100%
  scrumScore: number;
  kanbanScore: number;
  recommended: Methodology;
  reasoning: string;
  strengths: string[];
  considerations: string[];
}

export interface DiagnosticQuestion {
  id: string;
  title: string;
  description: string;
  iconName: string;
  options: {
    label: string;
    description: string;
    xpWeight: number;
    scrumWeight: number;
    kanbanWeight: number;
  }[];
}

export interface PairSession {
  id: string;
  projectId: string;
  driverId: string;
  navigatorId: string;
  featureName: string;
  startedAt: string;
  durationMinutes: number;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
}

export interface TddTestCase {
  id: string;
  projectId: string;
  featureName: string;
  testName: string;
  status: 'RED' | 'GREEN' | 'REFACTORED';
  codeSnippet?: string;
  lastRunAt: string;
}

export interface CiBuild {
  id: string;
  projectId: string;
  commitHash: string;
  commitMessage: string;
  author: string;
  status: 'SUCCESS' | 'FAILURE' | 'RUNNING';
  timestamp: string;
  durationSeconds: number;
  testsPassed: number;
  testsTotal: number;
}

export interface Sprint {
  id: string;
  projectId: string;
  number: number;
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED';
  totalPoints: number;
  completedPoints: number;
}

export interface PlanningPokerVote {
  memberId: string;
  vote: number | string | null; // e.g. 1, 2, 3, 5, 8, 13, 21, '?'
  hasVoted: boolean;
}

export interface PlanningPokerSession {
  id: string;
  projectId: string;
  taskId: string;
  taskTitle: string;
  votes: PlanningPokerVote[];
  revealed: boolean;
  consensusEstimate: number | null;
}

export interface DailyNote {
  id: string;
  projectId: string;
  date: string;
  author: string;
  yesterday: string;
  today: string;
  impediments: string;
}

export interface RetroCard {
  id: string;
  projectId: string;
  category: 'WENT_WELL' | 'TO_IMPROVE' | 'ACTION_ITEM';
  content: string;
  author: string;
  votes: number;
}

export type TechArea =
  | 'Desenvolvimento Frontend'
  | 'Desenvolvimento Backend'
  | 'Engenharia Fullstack'
  | 'DevOps / Cloud Infrastructure'
  | 'QA / Testes & Qualidade'
  | 'UI/UX Design & Product Design'
  | 'Data Science, BI & Inteligência Artificial'
  | 'Product Owner / PM'
  | 'Scrum Master / Agile Coach'
  | 'Desenvolvimento Mobile'
  | 'Segurança da Informação / CyberSecurity';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  techArea: string;
  password?: string;
  createdAt: string;
  avatarUrl?: string;
}

export interface ProjectMember {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MEMBER';
  techArea: string;
  joinedAt: string;
  avatar?: string;
}

export interface ProjectInvite {
  id: string;
  projectId: string;
  projectName: string;
  projectMethodology: Methodology;
  invitedByUserId: string;
  invitedByUserName: string;
  invitedEmail: string;
  inviteCode: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED';
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  projectId: string;
  senderId: string;
  senderName: string;
  senderRole?: 'ADMIN' | 'MEMBER' | 'SYSTEM';
  senderTechArea?: string;
  content: string;
  timestamp: string;
  isSystem?: boolean;
}

export interface MemberRemovalLog {
  id: string;
  projectId: string;
  memberId: string;
  memberName: string;
  removedByUserId: string;
  removedByUserName: string;
  justification: string;
  removedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  adminId: string; // User ID of creator/admin
  adminName?: string;
  adminEmail?: string;
  recommendedMethodology: Methodology;
  activeMethodology: Methodology;
  createdAt: string;
  tags: string[];
  members: ProjectMember[];
  teamSize: number; // Requested quantity of members
  
  // Custom WIP Limits for Kanban
  wipLimits: Record<KanbanColumnId, number>;
  
  // Status of project
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED';
  completedAt?: string;
  completedByUserId?: string;
  completionNotes?: string;

  // Invites & Logs
  invites?: ProjectInvite[];
  removalLogs?: MemberRemovalLog[];
  
  // Diagnostic metadata if filled
  diagnosticAnswers?: DiagnosticAnswer[];
  diagnosticResult?: DiagnosticResult;
}

