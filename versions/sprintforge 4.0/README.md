# SprintForge — Plataforma Unificada de Engenharia & Gestão Ágil

> **SprintForge** é uma plataforma moderna e completa para gerenciamento e diagnóstico de projetos sob as metodologias ágeis mais consolidadas da indústria de software: **Extreme Programming (XP)**, **Scrum** e **Kanban**.

---

## 📌 Sumário Executivo das Atualizações Recentes

Esta versão consolida grandes melhorias de experiência de usuário, visualização de dados, engenharia colaborativa, guias contextuais e arquitetura:

1. **Espaço Explicativo Contextual em Cada Aba de Funcionalidades (`TabExplainer`)**:
   - Cada aba dentro das metodologias (**Scrum**, **XP** e **Kanban**) agora conta com um painel superior explicativo e elegante com:
     - **Conceito & Finalidade** na metodologia ágil escolhida.
     - **Como Funciona na Prática**: Passo a passo de interação direta na plataforma.
     - **Boas Práticas Ágeis & Dicas de Ouro**: Recomendações dos maiores autores ágeis (Kent Beck, Jeff Sutherland, David J. Anderson).
     - **Controle de Visualização**: Botão interativo para recolher ou expandir o guia conforme a preferência do usuário.

2. **Detalhamento das Abas por Metodologia**:
   - **Módulo SCRUM**:
     - *Product & Sprint Backlog*: Gerenciamento do ciclo da Sprint, priorização de estórias e movimentação de status.
     - *Planning Poker Integrado*: Estimativa consensual por sequência de Fibonacci sincronizada com os integrantes do projeto.
     - *Progresso & Métricas*: Relatórios em tempo real com gráficos Recharts de conclusão, prioridades e velocidade.
     - *Gráfico Burndown*: Linha Ideal vs. Linha Real de queima diária de Story Points.
     - *Daily Scrum & Retrospectiva*: Registro diário de 15 minutos e cerimônia de melhoria contínua pós-sprint.
   - **Módulo XP (Extreme Programming)**:
     - *Pair Programming Tracker*: Temporizador Pomodoro XP de 25 min para alternância entre Piloto (Driver) e Copiloto (Navigator).
     - *Suíte TDD (Test-Driven Development)*: Matriz do ciclo Red-Green-Refactor com execução e validação de testes unitários.
     - *Continuous Integration (CI)*: Histórico de builds automatizados, commits, tempo de execução e status da branch principal.
     - *As 12 Práticas do XP*: Checklist e visão detalhada dos 12 pilares clássicos de engenharia do XP.
     - *Progresso & Métricas*: Acompanhamento analítico da evolução e esforço do projeto XP.
   - **Módulo KANBAN**:
     - *Quadro de Fluxo Contínuo & Limites WIP*: Drag & drop com prevenção visual e alertas em tempo real de sobrecarga de WIP por coluna.
     - *Métricas de Fluxo, Eficiência & Gargalos*: Lead Time Médio, Cycle Time Médio, Throughput Semanal e Eficiência de Fluxo.
     - *Progresso & Métricas*: Gráficos Recharts de distribuição e taxa de entrega de cards.

3. **Foto de Perfil & Integração de Dados**:
   - Campo dedicado para upload de foto de perfil (via seletor de arquivo local com conversão base64 ou URL).
   - Integração completa dos dados de perfil com persistência no estado global e sincronização com o backend.
   - Exibição dinâmica da foto no Header, no menu do usuário e nos cards de integrantes.

4. **Gráfico de Progresso do Projeto (Aba `PROGRESS`)**:
   - Integrado a todas as metodologias (**Scrum**, **XP** e **Kanban**).
   - Desenvolvido com **Recharts**:
     - *Distribuição de Tarefas por Status* (Donut Chart com percentuais).
     - *Distribuição por Nível de Prioridade* (Bar Chart colorido).
     - *Velocidade e Conclusão de Tarefas* (Composed Chart com barras e linha de tendência).
     - *Curva de Burndown da Sprint/Projeto* (Linha Ideal vs. Linha Real).
     - *Métricas em Tempo Real*: Taxa de Conclusão (%), Total de Horas Estimadas vs. Gastas, Bloqueios e Eficiência.

5. **Prazo de Entrega do Projeto (`deadline`)**:
   - Campo de data adicionado ao modal de criação de projetos (`NewProjectModal.tsx`).
   - Botões de atalho rápido para prazos pré-definidos: **+15 dias**, **+30 dias**, **+60 dias** e **+90 dias**.
   - Exibição do prazo no seletor de projetos e nos relatórios gerados.

6. **Scrum: Planning Poker Sincronizado com os Membros**:
   - Na aba **Planning Poker Integrado**, o número e a identificação das cartas de votação refletem exatamente a quantidade e os nomes dos integrantes registrados no projeto ativo.
   - Mecanismo de **Simulação de Votos da Equipe** com pontuações Fibonacci realistas (1, 2, 3, 5, 8, 13, 21).
   - Cálculo automático de consenso, média aritmética e distribuição de votos.

7. **Onboarding Guiado Suave com Driver.js**:
   - Configurado via biblioteca **driver.js** com animações suaves e estilo dark-mode integrado.
   - **Execução Automática Inteligente**: É disparado automaticamente uma única vez quando um novo usuário se cadastra/acessa a plataforma (rastreado por ID no `localStorage`).
   - **Botão de Reinício Manual**: Acesso rápido pelo ícone de Ajuda (`HelpCircle`) no topo do Header e no menu de opções do usuário.

8. **Landing Page Oficial**:
   - Nova tela de apresentação antes da entrada no Login/Cadastro.
   - Destaques visuais das três metodologias (XP, Scrum, Kanban).
   - Explorador interativo de metodologias e simulação ao vivo de cerimônias.
   - Botões de navegação fluida para login, cadastro e retorno à página inicial.

---

## 🏗️ Arquitetura e Organização de Diretórios

O projeto segue princípios de modularidade, separação de responsabilidades (SoC) e tipagem estrita com TypeScript:

```
├── src/
│   ├── components/
│   │   ├── auth/              # Autenticação (LoginScreen, AuthModal)
│   │   ├── dashboard/         # Visão geral, Central de Projetos e Diagnóstico
│   │   ├── diagnostic/        # Wizard de Diagnóstico de Metodologia Ideal
│   │   ├── kanban/            # Módulo Kanban (Drag & Drop, WIP, Métricas de Fluxo)
│   │   ├── landing/           # Landing Page Oficial (Hero, Comparativo, CTAs)
│   │   ├── profile/           # Perfil do Usuário, Foto e Exportação PDF
│   │   ├── scrum/             # Módulo Scrum (Backlog, Planning Poker, Dailies, Retro)
│   │   ├── shared/            # Componentes reutilizáveis
│   │   │   ├── TabExplainer.tsx        # Espaço Explicativo Dinâmico de cada Aba
│   │   │   ├── ProjectProgressTab.tsx  # Aba de Gráficos com Recharts
│   │   │   ├── NewProjectModal.tsx     # Criação de Projeto com Prazo
│   │   │   ├── ProjectMembersModal.tsx # Gestão de Integrantes & Convites
│   │   │   ├── ProjectChat.tsx         # Chat Isolado por Projeto
│   │   │   └── TaskModal.tsx           # Criação e Edição de Tarefas
│   │   └── xp/                # Módulo XP (Pair Timer, TDD Suite, CI Pipeline)
│   ├── context/
│   │   ├── AuthContext.tsx    # Gerenciamento de Sessão, Usuários e Foto
│   │   └── ProjectContext.tsx # Estado de Projetos, Membros, Convites e Chat
│   ├── data/
│   │   └── initialData.ts     # Dados padrão e sementes de demonstração
│   ├── services/
│   │   └── api.ts             # Cliente HTTP e integração com rotas backend
│   ├── types/
│   │   └── index.ts           # Interfaces TypeScript (User, Project, Task, etc.)
│   ├── utils/
│   │   ├── onboardingTour.ts  # Configuração e passos do Driver.js
│   │   └── pdfGenerator.ts    # Geração de relatórios PDF com jsPDF
│   ├── App.tsx                # Orquestrador de Telas, Modais e Onboarding
│   └── main.tsx               # Ponto de entrada do React
├── server.ts                  # Servidor Express com rotas de API REST
├── package.json               # Dependências e scripts
└── tsconfig.json              # Configurações do compilador TypeScript
```

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- **Node.js**: Versão 18 ou superior.
- **npm** ou **bun**.

### Instalação de Dependências
```bash
npm install
```

### Executar em Modo de Desenvolvimento
```bash
npm run dev
```
O servidor de desenvolvimento estará disponível em: `http://localhost:3000`.

### Compilação de Produção
```bash
npm run build
```

---

## 🛠️ Stack Tecnológica

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Recharts, @hello-pangea/dnd, Driver.js, jsPDF.
- **Backend / API**: Node.js, Express, TypeScript (tsx), Prisma ORM / PostgreSQL.
- **Autenticação**: Gerenciamento seguro de token JWT, hash com bcrypt e isolamento multilocatário por projeto.
