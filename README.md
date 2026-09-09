# SprintForge — Plataforma Unificada de Engenharia & Gestão Ágil

> **SprintForge** é uma plataforma moderna e completa para gerenciamento e diagnóstico de projetos sob as metodologias ágeis mais consolidadas da indústria de software: **Extreme Programming (XP)**, **Scrum** e **Kanban**.

---

## 📌 Sumário Executivo das Atualizações Recentes

Esta versão consolida grandes melhorias de experiência de usuário, visualização de dados, engenharia colaborativa, guias contextuais e arquitetura:

1. **Nova Aba Inteligente: Sprints Finalizadas (`HISTORY`) no Scrum**:
   - Criada uma aba dedicada e inteligente para arquivar o histórico completo de Sprints concluídas do projeto.
   - **Isolamento de Backlog**: As tarefas concluídas de sprints passadas são mantidas nessa aba com rastreabilidade total, sem poluir o Product Backlog.
   - **Preservação de Escopo**: Ao concluir uma Sprint ativa pelo botão "Concluir Sprint 🏆", tarefas que não foram finalizadas retornam automaticamente para o Product Backlog para serem replanejadas.
   - **Métricas Históricas**: Painel consolidado com Sprints Concluídas, Total de Story Points Entregues, Velocidade Média (pts/sprint), Taxa de Acurácia (%) e detalhamento de cada estória entregue.

2. **Revisão Completa do Planning Poker Integrado**:
   - **Seletor de Estórias**: Possibilidade de selecionar qualquer estória do Product Backlog ou Sprint Backlog para estimativa.
   - **Votação Fibonacci Interativa**: Cartas interativas (1, 2, 3, 5, 8, 13, 21, ?) com destaque visual para a escolha do usuário logado.
   - **Simulação de Votos da Equipe**: Botão para preencher realisticamente os votos dos demais integrantes registrados no projeto.
   - **Cálculo de Consenso & Aplicação em 1 Clique**: Cálculo do Story Point consensual mais próximo na escala Fibonacci e botão direto para **Salvar Estimativa na Tarefa** (`applyPokerEstimateToTask`).

3. **Revisão e Sincronização Dinâmica do Burndown Chart**:
   - O gráfico agora é **100% dinâmico e sincronizado em tempo real** com as tarefas e Story Points reais da Sprint ativa.
   - **Reatividade Imediata**: Ao marcar uma tarefa da Sprint como "Concluído ✓", a Linha Real de trabalho restante no gráfico é atualizada instantaneamente.
   - **KPIs da Sprint**: Painel no topo com Total Planejado, Pontos Queimados (% da meta), Trabalho Restante e Diagnóstico do Ritmo da Sprint (No Ritmo / Adiantado vs. Atenção no Ritmo).
   - **Detalhamento de Tarefas**: Tabela com todas as tarefas da Sprint e seu impacto na queima diária.

4. **Correção de Duplicidade no Backlog**:
   - Ao mover/puxar uma tarefa do Product Backlog para o Sprint Backlog, a tarefa é transferida de forma exclusiva, garantindo que não permaneçam réplicas ou clones no Product Backlog.

5. **Espaço Explicativo Contextual em Cada Aba de Funcionalidades (`TabExplainer`)**:
   - Cada aba dentro das metodologias (**Scrum**, **XP** e **Kanban**) conta com um painel superior explicativo e elegante com:
     - **Conceito & Finalidade** na metodologia ágil escolhida.
     - **Como Funciona na Prática**: Passo a passo de interação direta na plataforma.
     - **Boas Práticas Ágeis & Dicas de Ouro**: Recomendações dos maiores autores ágeis.
     - **Controle de Visualização**: Botão interativo para recolher ou expandir o guia conforme a preferência do usuário.

6. **Detalhamento das Abas por Metodologia**:
   - **Módulo SCRUM**:
     - *Product & Sprint Backlog*: Gerenciamento do ciclo da Sprint, priorização de estórias e movimentação de status sem duplicatas.
     - *Sprints Finalizadas*: Histórico inteligente e detalhado de ciclos passados com métricas e estórias arquivadas.
     - *Planning Poker Integrado*: Estimativa consensual por sequência de Fibonacci com aplicação direta na tarefa.
     - *Gráfico Burndown*: Linha Ideal vs. Linha Real sincronizada em tempo real com o esforço restante da Sprint ativa.
     - *Progresso & Métricas*: Relatórios em tempo real com gráficos Recharts de conclusão, prioridades e velocidade.
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
- **Backend / API**: Node.js, Express, TypeScript (tsx/esbuild), Prisma ORM / PostgreSQL.
- **Autenticação**: Gerenciamento seguro de token JWT, hash com bcrypt e isolamento multilocatário por projeto.

---

# 🏛️ Documentação Completa da Arquitetura do Sistema

Esta seção detalha minuciosamente a arquitetura de software adotada no **SprintForge**, cobrindo o design do Frontend, a estrutura do Backend, o modelo de banco de dados relacional e os fluxos de integração entre as camadas.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             SPRINTFORGE ARCHITECTURE                             │
└──────────────────────────────────────────────────────────────────────────────────┘
                                        │
           ┌────────────────────────────┴────────────────────────────┐
           ▼                                                         ▼
 ┌───────────────────┐                                     ┌───────────────────┐
 │ FRONTEND (CLIENT) │ ◄────────── HTTP / REST ──────────► │ BACKEND (SERVER)  │
 │ React 19 + TS     │             JSON API                │ Express + Node.js │
 └───────────────────┘                                     └───────────────────┘
           │                                                         │
   ┌───────┴───────┐                                         ┌───────┴───────┐
   ▼               ▼                                         ▼               ▼
┌──────┐      ┌─────────┐                              ┌───────────┐   ┌───────────┐
│State │      │ UI &    │                              │ JWT & RBAC│   │Prisma ORM │
│Ctxs  │      │ Modules │                              │Middleware │   │PostgreSQL │
└──────┘      └─────────┘                              └───────────┘   └───────────┘
```

---

## 🎨 1. Arquitetura Frontend (Client-Side)

O frontend foi construído utilizando **React 19** com **TypeScript** e **Tailwind CSS**, seguindo princípios de arquitetura baseada em componentes (*Component-Driven Architecture*), alta coesão e baixo acoplamento.

### 1.1. Organização das Camadas Frontend

```
src/
├── components/          # Camada de Apresentação e Telas
│   ├── auth/            # Telas de Login, Registro, Recuperação de Senha
│   ├── dashboard/       # Dashboard Principal, Cards de Resumo e Ações Rápidas
│   ├── diagnostic/      # Assistente interativo para diagnóstico de metodologia
│   ├── kanban/          # Módulo Kanban com Drag & Drop e Métricas de Fluxo
│   ├── landing/         # Landing Page institucional e explicativa
│   ├── profile/         # Gestão de Perfil, Foto e Emissão de Relatório PDF
│   ├── scrum/           # Módulo Scrum (Backlog, Poker, Burndown, Dailies, Retro)
│   ├── shared/          # Componentes reutilizáveis e modais globais
│   └── xp/              # Módulo XP (Pair Timer, Suíte TDD, CI Pipeline)
├── context/             # Camada de Estado Global (Context API + Local Persistence)
│   ├── AuthContext.tsx  # Autenticação, Usuário Corrente, Sessão e Perfis
│   └── ProjectContext.tsx # Estado dos Projetos, Membros, Sprints, Tarefas e Chat
├── services/            # Camada de Comunicação com APIs Externas e Backend
│   └── api.ts           # Cliente HTTP centralizado com interceptor de JWT e Fallback
├── types/               # Camada de Tipagem e Contratos de Dados
│   └── index.ts         # Interfaces, Enums e Types TypeScript compartilhados
└── utils/               # Funções Utilitárias e Helpers
    ├── onboardingTour.ts# Configuração do Tour Guiado Interativo (Driver.js)
    └── pdfGenerator.ts  # Geração e formatação de relatórios em PDF (jsPDF)
```

### 1.2. Módulos de Domínio e Componentes Principais

1. **Módulo Scrum (`components/scrum/ScrumModule.tsx`)**:
   - **Gerenciador de Backlog**: Alternância fluida entre Product Backlog e Sprint Backlog com isolamento exclusivo de tarefas.
   - **Sprints Finalizadas (`HISTORY`)**: Painel de ciclos encerrados com métricas de entrega, prazo planejado vs. conclusão real e estórias arquivadas.
   - **Planning Poker Integrado**: Sistema de votação Fibonacci com reflexo fiel dos integrantes do projeto, simulação de votos e persistência do consenso na tarefa.
   - **Burndown Chart Dinâmico**: Curva Ideal vs. Real calculada em tempo real a partir dos Story Points concluídos da Sprint ativa.
   - **Daily Scrum & Retrospectiva**: Registro de reuniões diárias e post-its interativos com data, controle de 1 curtida por membro e botões de exclusão.
   - **Progresso & Métricas**: Gráficos Recharts analíticos de velocidade e entregas.

2. **Módulo XP (`components/xp/XpModule.tsx`)**:
   - **Pair Programming Tracker**: Temporizador Pomodoro cíclico (25 min) para troca de papéis entre *Driver* (Piloto) e *Navigator* (Copiloto).
   - **Suíte TDD**: Painel do ciclo *Red-Green-Refactor* com execução e simulação de testes automatizados com tempo de execução em milissegundos.
   - **Continuous Integration (CI)**: Pipeline de integração contínua com histórico de builds, branches, hash de commit e status de execução.
   - **As 12 Práticas do XP**: Checklist iterativo de aderência aos pilares da engenharia ágil.

3. **Módulo Kanban (`components/kanban/KanbanModule.tsx`)**:
   - **Quadro de Fluxo Contínuo**: Drag & drop de cartões (`@hello-pangea/dnd`) com sinalização visual e bloqueio de limite de trabalho em progresso (WIP).
   - **Métricas de Fluxo Lean**: Cálculo automático de *Lead Time*, *Cycle Time*, *Throughput* semanal e taxa de eficiência do fluxo.

4. **Componentes Compartilhados (`components/shared/`)**:
   - `TabExplainer.tsx`: Painel explicativo colapsável com conceito, guia prático e boas práticas ágeis em cada aba.
   - `ProjectProgressTab.tsx`: Painel gráfico unificado com Recharts (distribuição por status, prioridades, velocidade e burndown).
   - `ProjectChat.tsx`: Canal de comunicação isolado contextualmente por projeto com suporte a mensagens de sistema.
   - `NewProjectModal.tsx` e `ProjectMembersModal.tsx`: Gestão de criação de projetos (com prazos) e controle de integrantes/convites.
   - `TaskModal.tsx`: Criação e edição detalhada de tarefas e estórias.

### 1.3. Gestão de Estado Global e Resiliência

- **`AuthContext`**: Gerencia o ciclo de vida da autenticação, armazenamento do token JWT, perfil do usuário logado e persistência de avatar.
- **`ProjectContext`**: Centraliza o estado completo da aplicação (projetos ativos, tarefas, membros, convites, dailies, poker e retrospectiva). Utiliza uma arquitetura híbrida de persistência reativa no `localStorage` combinada com sincronização via cliente de API (`api.ts`).
- **Resiliência Offline**: Se o backend estiver indisponível ou em configuração inicial, o cliente HTTP (`api.ts`) aciona um fallback automático sem quebrar a navegação ou o estado em memória do usuário.

---

## ⚙️ 2. Arquitetura Backend (Server-Side)

O backend do SprintForge foi construído em **Node.js** utilizando o framework **Express** em conjunto com **TypeScript** e **Prisma ORM**, estruturado no padrão arquitetural em camadas (Controller-Route-Middleware-Service-Data).

### 2.1. Organização das Camadas Backend

```
server/
├── controllers/         # Camada de Controle e Lógica de Negócio
│   ├── auth.controller.ts     # Registro, Login, Reset de Senha, Perfil
│   ├── chat.controller.ts     # Envio e listagem de mensagens por projeto
│   ├── project.controller.ts  # CRUD de Projetos, Membros, Convites e Exclusões
│   ├── scrum.controller.ts    # Sprints, Daily Notes, Retrospectiva e Poker
│   ├── task.controller.ts     # CRUD de Tarefas, Priorização e Movimentação
│   └── xp.controller.ts       # Sessões de Pair Programming, TDD e Builds de CI
├── db/                  # Instância e Configuração do Banco de Dados
│   └── prisma.ts        # Singleton do PrismaClient conectado ao PostgreSQL
├── middleware/          # Camada de Interceptores e Segurança
│   ├── auth.ts          # Validação e decodificação do Token JWT (Bearer Token)
│   ├── errorHandler.ts  # Middleware global de tratamento e formatação de erros
│   └── validate.ts      # Validações de payload e regras estruturais
├── routes/              # Camada de Definição de Rotas RESTful
│   ├── auth.routes.ts   # Rotas de Autenticação (/api/auth)
│   ├── chat.routes.ts   # Rotas de Chat (/api/chat)
│   ├── index.ts         # Agregador central de rotas (/api)
│   ├── project.routes.ts# Rotas de Projetos e Membros (/api/projects)
│   ├── scrum.routes.ts  # Rotas de Cerimônias Scrum (/api/scrum)
│   ├── task.routes.ts   # Rotas de Tarefas (/api/tasks)
│   └── xp.routes.ts     # Rotas de Engenharia XP (/api/xp)
└── server.ts            # Ponto de Entrada da Aplicação, Middlewares e Servidor SPA
```

### 2.2. Pipeline de Execução de Requisições HTTP

1. **Ingresso**: A requisição atinge `server.ts` passando pelos middlewares de CORS, parser de JSON (`express.json`) e logger de desenvolvimento.
2. **Roteamento**: É despachada para o roteador correspondente sob o prefixo `/api`.
3. **Autenticação**: Rotas protegidas executam o middleware `authenticateToken` (`server/middleware/auth.ts`), que valida o cabeçalho `Authorization: Bearer <token>`, decodifica o JWT e anexa o usuário em `req.user`.
4. **Controlador**: O controlador recebe a requisição, aplica as regras de negócio de domínio e orquestra a persistência via Prisma.
5. **Persistência**: Operações transacionais e consultas são executadas via Prisma Client contra a base de dados PostgreSQL.
6. **Resposta e Erros**: O controlador devolve a resposta padronizada em JSON. Qualquer exceção não capturada é tratada centralizadamente pelo `errorHandler.ts`.

---

## 🗄️ 3. Modelo de Dados Relacional (PostgreSQL / Prisma ORM)

O banco de dados foi modelado de forma normalizada para garantir integridade referencial, isolamento entre projetos e consistência metodológica.

### 3.1. Diagrama Entidade-Relacionamento Resumido

```
┌──────────────┐       1:N       ┌─────────────────────┐
│     User     ├────────────────►│    ProjectMember    │
└──────┬───────┘                 └──────────┬──────────┘
       │                                    │ N:1
       │ 1:N (Admin)                        ▼
       │                         ┌─────────────────────┐
       └────────────────────────►│       Project       │
                                 └──────────┬──────────┘
                                            │
       ┌──────────────────┬─────────────────┼──────────────────┬──────────────────┐
       ▼                  ▼                 ▼                  ▼                  ▼
┌──────────────┐   ┌──────────────┐  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│     Task     │   │    Sprint    │  │ PairSession  │   │  DailyNote   │   │ ChatMessage  │
└──────────────┘   └──────┬───────┘  └──────────────┘   └──────────────┘   └──────────────┘
                          │ 1:N
                          ▼
                   ┌──────────────┐
                   │  RetroCard   │
                   └──────────────┘
```

### 3.2. Principais Entidades e Responsabilidades

- **`User`**: Armazena credenciais (com `passwordHash`), informações de contato, área técnica (`techArea`) e foto de perfil (`avatarUrl`).
- **`Project`**: Entidade centralizadora com vínculo ao administrador (`adminId`), metodologia ativa (`XP`, `SCRUM` ou `KANBAN`), tamanho da equipe, data limite (`deadline`) e status.
- **`ProjectMember`**: Tabela associativa com chave única composta (`projectId`, `userId`) e controle de papéis (`ADMIN`, `MEMBER`, `VIEWER`).
- **`ProjectInvite`**: Convites com código único (`inviteCode`), e-mail de destino e controle de expiração/status.
- **`Task`**: Tarefas e estórias de usuário com vínculo ao projeto e à sprint, prioridades (`Baixa`, `Média`, `Alta`, `Crítica`), Story Points e status de fluxo.
- **`Sprint`**: Ciclos de desenvolvimento Scrum com metas (`goal`), datas de início/fim, status (`PLANNED`, `ACTIVE`, `COMPLETED`) e velocidade.
- **`PairSession`**: Sessões de programação em par do XP vinculando o Piloto (*Driver*), Copiloto (*Navigator*), branch e duração.
- **`TddTest` & `CiBuild`**: Suíte de testes unitários e histórico de builds/commits da integração contínua do XP.
- **`DailyNote` & `RetroCard`**: Registros da Daily Scrum e cartões de Retrospectiva categorizados (`WENT_WELL`, `TO_IMPROVE`, `ACTION_ITEMS`) com votos e data.
- **`ChatMessage`**: Histórico de mensagens de chat em tempo real com isolamento estrito por `projectId`.

---

## 🔒 4. Segurança e Controle de Acesso (RBAC)

1. **Criptografia de Senhas**: Senhas de usuários são criptografadas com `bcryptjs` antes da persistência no banco de dados.
2. **Tokens de Acesso (JWT)**: Sessões são autenticadas por meio de JSON Web Tokens assinados digitalmente com expiração configurável.
3. **Isolamento Multilocatário (Tenant Isolation)**: Todas as consultas a tarefas, sprints, notas, post-its e mensagens de chat exigem obrigatoriamente o identificador do projeto (`projectId`), impedindo vazamento de dados entre projetos distintos.
4. **Controle Baseado em Papéis (RBAC)**:
   - **`ADMIN`**: Criação/arquivamento de projetos, gestão e remoção de membros, configuração de prazos e metodologias.
   - **`MEMBER`**: Criação de tarefas, estimativa no Planning Poker, movimentação de quadro, registro de Dailies, post-its e chat.
   - **`VIEWER`**: Acesso somente-leitura aos quadros, relatórios e métricas de progresso.

---

## 🔄 5. Contrato de Comunicação Frontend ↔ Backend

As trocas de mensagens entre cliente e servidor seguem o protocolo **HTTP/1.1 REST** com payloads em formato **JSON**.

### 5.1. Padrão Unificado de Resposta da API

Todas as rotas do backend respondem sob uma estrutura padronizada e previsível:

```typescript
// Resposta de Sucesso
{
  "success": true,
  "data": { ... },
  "message": "Operação realizada com sucesso."
}

// Resposta de Erro
{
  "success": false,
  "message": "Mensagem descritiva do erro."
}
```

### 5.2. Mapa Principal de Endpoints

| Método | Endpoint | Descrição |
|---|---|---|
| `POST` | `/api/auth/register` | Cadastro de novo usuário |
| `POST` | `/api/auth/login` | Autenticação e geração de token JWT |
| `GET` | `/api/auth/me` | Dados do usuário autenticado |
| `PUT` | `/api/auth/profile` | Atualização de perfil e foto |
| `GET` | `/api/projects` | Listagem de projetos do usuário |
| `POST` | `/api/projects` | Criação de novo projeto com prazo |
| `GET` | `/api/tasks?projectId=:id` | Consulta de tarefas do projeto |
| `POST` | `/api/tasks` | Criação de nova tarefa / estória |
| `PATCH`| `/api/tasks/:id/status` | Movimentação de status no Kanban/Scrum |
| `GET` | `/api/scrum/sprints?projectId=:id` | Listagem de sprints ativas e históricas |
| `POST` | `/api/scrum/daily` | Registro de anotação da Daily Scrum |
| `POST` | `/api/scrum/retro/vote` | Votação em post-it de retrospectiva |
| `GET` | `/api/chat/:projectId` | Histórico de mensagens do chat do projeto |
| `POST` | `/api/chat/:projectId` | Envio de mensagem de texto no chat |
