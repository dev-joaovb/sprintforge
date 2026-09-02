import { DiagnosticQuestion, DiagnosticResult, Methodology } from '../types';

export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: 'req_change',
    title: 'Frequência de Mudança nos Requisitos',
    description: 'Com que frequência as prioridades, escopo e funcionalidades do projeto mudam?',
    iconName: 'RefreshCw',
    options: [
      {
        label: 'Muito Alta (Mudanças diárias ou em tempo real)',
        description: 'Demandas chegam a todo momento e o planejamento muda no decorrer do dia.',
        xpWeight: 35,
        scrumWeight: 10,
        kanbanWeight: 45,
      },
      {
        label: 'Média/Alta (Ajustes frequentes a cada 1 ou 2 semanas)',
        description: 'O produto evolui com ciclos de feedback constantes, mas permite certo planejamento curto.',
        xpWeight: 30,
        scrumWeight: 40,
        kanbanWeight: 30,
      },
      {
        label: 'Baixa/Previsível (Escopo bem definido com poucas alterações)',
        description: 'Existem entregáveis bem demarcados e roadmap previsível para os próximos meses.',
        xpWeight: 15,
        scrumWeight: 50,
        kanbanWeight: 20,
      },
    ],
  },
  {
    id: 'team_maturity',
    title: 'Tamanho e Perfil da Equipe',
    description: 'Qual a estrutura, tamanho e senioridade do time que atuará neste projeto?',
    iconName: 'Users',
    options: [
      {
        label: 'Equipe Pequena e Técnica (3 a 6 devs altamente focados em código)',
        description: 'Desenvolvedores sêniores e plenos focados em refatoração contínua, pares e alta qualidade.',
        xpWeight: 50,
        scrumWeight: 20,
        kanbanWeight: 30,
      },
      {
        label: 'Squad Multidisciplinar (5 a 9 pessoas: PO, Scrum Master, Devs, QA, Designer)',
        description: 'Estrutura ágil clássica com papéis bem delimitados e rituais formais.',
        xpWeight: 20,
        scrumWeight: 50,
        kanbanWeight: 30,
      },
      {
        label: 'Equipe de Operação/Suporte/Manutenção Continuada',
        description: 'Equipe que lida com tickets variados, sustentação e pequenas melhorias sem ciclo fixo.',
        xpWeight: 10,
        scrumWeight: 15,
        kanbanWeight: 55,
      },
    ],
  },
  {
    id: 'delivery_cycle',
    title: 'Ritmo de Entregas Desejado',
    description: 'Qual a expectativa de cadência de lançamentos em produção para o cliente?',
    iconName: 'Rocket',
    options: [
      {
        label: 'Deploy Contínuo em Produção (Múltiplas vezes ao dia/semana)',
        description: 'Código é testado e entregue assim que uma funcionalidade fica pronta.',
        xpWeight: 45,
        scrumWeight: 15,
        kanbanWeight: 40,
      },
      {
        label: 'Ciclos de Entrega Timeboxed (Timebox fixo de 1 a 3 semanas)',
        description: 'Entregas agrupadas ao final de cada iteração previsível com demonstração e revisão.',
        xpWeight: 20,
        scrumWeight: 50,
        kanbanWeight: 20,
      },
      {
        label: 'Fluxo Contínuo Orientado a Gargalos (Sem timebox rigido, foco em Lead Time)',
        description: 'Prioridade total em puxar a próxima demanda assim que a capacidade for liberada.',
        xpWeight: 15,
        scrumWeight: 20,
        kanbanWeight: 50,
      },
    ],
  },
  {
    id: 'client_involvement',
    title: 'Envolvimento do Cliente / Product Owner',
    description: 'Qual o nível de presença e disponibilidade do cliente no dia a dia do desenvolvimento?',
    iconName: 'UserCheck',
    options: [
      {
        label: 'Presença On-site / Diária (Cliente integrado diretamente à equipe)',
        description: 'Respostas em tempo real, validação imediata de regras de negócio e testes de aceitação.',
        xpWeight: 45,
        scrumWeight: 35,
        kanbanWeight: 20,
      },
      {
        label: 'Reuniões Estruturadas (Planejamento, Demos e Revisões por iteração)',
        description: 'Participação ativa nos rituais de início e fim de sprint com feedback consolidado.',
        xpWeight: 20,
        scrumWeight: 50,
        kanbanWeight: 25,
      },
      {
        label: 'Assíncrono / Ad-hoc (Disponibilidade pontual via fila de chamados/pedidos)',
        description: 'Cliente define demandas na fila priorizada e valida quando concluído.',
        xpWeight: 10,
        scrumWeight: 15,
        kanbanWeight: 50,
      },
    ],
  },
  {
    id: 'engineering_focus',
    title: 'Foco Principal de Engenharia & Qualidade',
    description: 'Qual o principal pilar técnico estratégico que definirá o sucesso do projeto?',
    iconName: 'Code',
    options: [
      {
        label: 'Excelência Técnica Extrema (TDD, Pair Programming, Código Limpo, Refatoração)',
        description: 'Código altamente complexo ou crítico que exige zero defeito e alta coesão técnica.',
        xpWeight: 50,
        scrumWeight: 20,
        kanbanWeight: 15,
      },
      {
        label: 'Previsibilidade e Foco em Metas do Negócio por Período (Sprints)',
        description: 'Alinhamento forte com datas comemorativas, roadmap de produto e metas comerciais.',
        xpWeight: 20,
        scrumWeight: 50,
        kanbanWeight: 20,
      },
      {
        label: 'Otimização do Tempo de Resposta e Redução de Trabalho Paralelo (WIP)',
        description: 'Eliminar desperdícios no processo, desbloquear gargalos e acelerar o Lead Time.',
        xpWeight: 15,
        scrumWeight: 20,
        kanbanWeight: 50,
      },
    ],
  },
];

export function calculateDiagnosticResult(answers: { questionId: string; selectedOptionIndex: number }[]): DiagnosticResult {
  let totalXp = 0;
  let totalScrum = 0;
  let totalKanban = 0;

  answers.forEach((ans) => {
    const question = DIAGNOSTIC_QUESTIONS.find((q) => q.id === ans.questionId);
    if (question && question.options[ans.selectedOptionIndex]) {
      const opt = question.options[ans.selectedOptionIndex];
      totalXp += opt.xpWeight;
      totalScrum += opt.scrumWeight;
      totalKanban += opt.kanbanWeight;
    }
  });

  const sum = totalXp + totalScrum + totalKanban || 1;
  const xpScore = Math.round((totalXp / sum) * 100);
  const scrumScore = Math.round((totalScrum / sum) * 100);
  const kanbanScore = Math.round((totalKanban / sum) * 100);

  let recommended: Methodology = 'SCRUM';
  if (xpScore >= scrumScore && xpScore >= kanbanScore) {
    recommended = 'XP';
  } else if (kanbanScore >= scrumScore && kanbanScore >= xpScore) {
    recommended = 'KANBAN';
  } else {
    recommended = 'SCRUM';
  }

  let reasoning = '';
  let strengths: string[] = [];
  let considerations: string[] = [];

  if (recommended === 'XP') {
    reasoning =
      'O diagnóstico indicou forte orientação à excelência em engenharia, necessidade de feedback ultra-rápido do cliente e código com alta taxa de mudança. O Extreme Programming (XP) garantirá qualidade máxima via TDD, Pair Programming e CI/CD.';
    strengths = [
      'Desenvolvimento orientado a testes (TDD) garante cobertura e zero regressões',
      'Pair Programming eleva a qualidade do código e dissemina conhecimento no time',
      'Integração Contínua (CI) com deploys frequentes para feedback em tempo real',
    ];
    considerations = [
      'Exige disciplina técnica rigorosa de toda a equipe',
      'Necessita de envolvimento constante e direto do cliente ou representante do negócio',
    ];
  } else if (recommended === 'KANBAN') {
    reasoning =
      'Seu projeto demanda fluxo contínuo, adaptação flexível a prioridades e redução de gargalos de trabalho em andamento. O Kanban maximiza a vazão sem a rigidez de timeboxes fixos.';
    strengths = [
      'Visualização transparente do fluxo de trabalho e identificação imediata de bloqueios',
      'Limites de WIP (Work in Progress) evitam sobrecarga da equipe',
      'Foco em métricas chave como Lead Time e Cycle Time',
    ];
    considerations = [
      'Pode haver perda de previsibilidade de prazos longos sem estimação cautelosa',
      'Exige disciplina para não acumular demandas paradas sem acompanhamento',
    ];
  } else {
    reasoning =
      'Seu projeto se beneficia de previsibilidade por iterações (Sprints), metas claras de entregas de valor e papéis estruturados. O Scrum proporcionará cadência sustentável e momentos formais de inspeção e adaptação.';
    strengths = [
      'Sprints fixas com metas claras e comprometimento do time',
      'Rituais de Daily, Planning e Retrospectiva para alinhamento contínuo',
      'Métricas consolidadas como Burndown Chart e Velocity do time',
    ];
    considerations = [
      'Mudanças radicais no meio de uma Sprint ativa devem ser evitadas',
      'Necessidade de estimativas em Story Points e grooming do backlog',
    ];
  }

  return {
    xpScore,
    scrumScore,
    kanbanScore,
    recommended,
    reasoning,
    strengths,
    considerations,
  };
}
