import React, { useState, useEffect } from 'react';
import { Methodology } from '../../types';
import {
  X,
  BookOpen,
  Code2,
  Repeat,
  Kanban as KanbanIcon,
  CheckCircle2,
  Zap,
  Users,
  Target,
  Clock,
  Layers,
  HelpCircle,
  Lightbulb,
  ShieldCheck,
  BarChart3,
  Flame,
  ArrowRight,
} from 'lucide-react';

interface MethodologyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMethodology: Methodology;
}

export const MethodologyGuideModal: React.FC<MethodologyGuideModalProps> = ({
  isOpen,
  onClose,
  initialMethodology,
}) => {
  const [activeTab, setActiveTab] = useState<Methodology>(initialMethodology);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialMethodology);
    }
  }, [isOpen, initialMethodology]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 text-[10px] font-bold uppercase tracking-wider mb-1">
                Guia de Metodologias Ágeis & Boas Práticas
              </div>
              <h2 className="text-xl font-extrabold text-white">Como Utilizar {activeTab} no Seu Contexto</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs for quick switching between XP, Scrum, Kanban */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/30 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('XP')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
              activeTab === 'XP'
                ? 'bg-cyan-500/10 text-cyan-300 border-cyan-400 font-extrabold'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Code2 className="w-4 h-4 text-cyan-400" />
            <span>XP (Extreme Programming)</span>
          </button>

          <button
            onClick={() => setActiveTab('SCRUM')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
              activeTab === 'SCRUM'
                ? 'bg-purple-500/10 text-purple-300 border-purple-400 font-extrabold'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Repeat className="w-4 h-4 text-purple-400" />
            <span>Scrum Framework</span>
          </button>

          <button
            onClick={() => setActiveTab('KANBAN')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
              activeTab === 'KANBAN'
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-400 font-extrabold'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <KanbanIcon className="w-4 h-4 text-emerald-400" />
            <span>Kanban Continuous Flow</span>
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-300 text-sm">
          
          {/* XP Content */}
          {activeTab === 'XP' && (
            <div className="space-y-6">
              
              {/* Summary Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-500/30 space-y-3">
                <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-base">
                  <Zap className="w-5 h-5 fill-current" /> O que é Extreme Programming (XP)?
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  XP é uma metodologia ágil focada na **excelência técnica de engenharia de software**, alta capacidade de resposta a mudanças de requisitos e feedback contínuo. Leva as práticas de programação ao extremo para garantir qualidade de código impecável e zero defeitos.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 text-[11px] font-bold border border-cyan-500/30">
                    Foco: Qualidade de Código & Engenharia
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-medium">
                    Iterações: 1 a 2 Semanas
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-medium">
                    Feedback: Minutos / Horas
                  </span>
                </div>
              </div>

              {/* How to use in SprintForge Context */}
              <div className="space-y-4">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-400" /> Como Utilizar o Módulo XP no SprintForge
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                      <Users className="w-4 h-4 text-cyan-400" /> 1. Pair Programming Tracker
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Selecione uma dupla de desenvolvedores (**Piloto / Driver** que digita e **Copiloto / Navigator** que valida a arquitetura). Ative o timer Pomodoro de 25min para alternar os papéis e manter o foco elevado.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 2. Ciclo TDD (Red-Green-Refactor)
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Cadastre os cenários de testes antes do código. Mantenha o teste em <span className="text-rose-400 font-bold">RED</span> (falhando), implemente a solução até ficar <span className="text-emerald-400 font-bold">GREEN</span> e refatore para manter o design simples.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                      <Zap className="w-4 h-4 text-purple-400" /> 3. Integração Contínua (CI/CD)
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Simule a execução da suíte de testes integrada e acompanhe o pipeline de compilação. Em XP, novos códigos são integrados e validados múltiplas vezes ao dia.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                      <ShieldCheck className="w-4 h-4 text-amber-400" /> 4. As 12 Práticas do XP
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Utilize o checklist das 12 práticas (Design Simples, Padrão de Código, Ritmo Sustentável, Propriédade Coletiva) para auditoria e evolução da equipe.
                    </p>
                  </div>
                </div>
              </div>

              {/* Best fit & recommendations */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Quando XP é o mais recomendado?</h4>
                <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                  <li>Projetos de alta complexidade técnica e requisitos hipermutáveis.</li>
                  <li>Sistemas críticos onde falhas em produção geram grande prejuízo financeiro ou reputacional.</li>
                  <li>Equipes de desenvolvimento sênior focadas em código limpo, TDD e refatoração diária.</li>
                </ul>
              </div>

            </div>
          )}

          {/* Scrum Content */}
          {activeTab === 'SCRUM' && (
            <div className="space-y-6">
              
              {/* Summary Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 to-slate-900 border border-purple-500/30 space-y-3">
                <div className="flex items-center gap-2 text-purple-400 font-extrabold text-base">
                  <Repeat className="w-5 h-5" /> O que é o Scrum Framework?
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  O Scrum é um framework iterativo e incremental estruturado em ciclos fixos de tempo chamados **Sprints** (normalmente de 1 a 4 semanas). Ele garante transparência, inspeção frequente e adaptação através de rituais bem definidos.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-[11px] font-bold border border-purple-500/30">
                    Foco: Entregas Iterativas & Previsibilidade
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-medium">
                    Sprints: 1 a 4 Semanas
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-medium">
                    Papéis: PO, Scrum Master, Developers
                  </span>
                </div>
              </div>

              {/* How to use in SprintForge Context */}
              <div className="space-y-4">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-400" /> Como Utilizar o Módulo Scrum no SprintForge
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                      <Target className="w-4 h-4 text-purple-400" /> 1. Sprint Goal & Backlog
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Defina a meta clara da Sprint (**Sprint Goal**) no banner do topo. Puxe itens do **Product Backlog** para o **Sprint Backlog** priorizando por valor de negócio.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                      <Layers className="w-4 h-4 text-cyan-400" /> 2. Planning Poker
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Efetue votação assíncrona ou em tempo real de Story Points usando a sequência de Fibonacci (1, 2, 3, 5, 8, 13, 21). Revele as cartas para consenso sem viés de ancoragem.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                      <BarChart3 className="w-4 h-4 text-emerald-400" /> 3. Burndown Chart
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Monitore diariamente a queima de Story Points. A linha roxa (Real) deve acompanhar a linha tracejada (Ideal) para atingir 100% da meta na data limite.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                      <Users className="w-4 h-4 text-amber-400" /> 4. Daily Scrum & Retrospectiva
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Registre notas da reunião diária e utilize o quadro de post-its da **Retrospectiva** (O que funcionou, O que melhorar, Ações) com contagem de votos.
                    </p>
                  </div>
                </div>
              </div>

              {/* Best fit & recommendations */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Quando Scrum é o mais recomendado?</h4>
                <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                  <li>Projetos de novos produtos (SaaS/Apps) com roadmap e entregas planejadas em marcos regulares.</li>
                  <li>Equipes multidisciplinares que precisam de rituais claros para alinhamento e autonomia.</li>
                  <li>Cenários onde stakeholders necessitam de previsibilidade de escopo ao final de cada Sprint.</li>
                </ul>
              </div>

            </div>
          )}

          {/* Kanban Content */}
          {activeTab === 'KANBAN' && (
            <div className="space-y-6">
              
              {/* Summary Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-base">
                  <KanbanIcon className="w-5 h-5" /> O que é Kanban (Fluxo Contínuo)?
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Kanban é um sistema visual de gestão de trabalho puxado focando na **otimização de fluxo contínuo**, eliminação de gargalos e limitação estrita do Trabalho em Andamento (**WIP - Work in Progress**). Não utiliza Sprints nem datas rígidas.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
                    Foco: Otimização de Fluxo & Redução de Lead Time
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-medium">
                    Ritmo: Contínuo (Puxado)
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-medium">
                    Regra Chave: Limite de WIP Explicito
                  </span>
                </div>
              </div>

              {/* How to use in SprintForge Context */}
              <div className="space-y-4">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-400" /> Como Utilizar o Módulo Kanban no SprintForge
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                      <KanbanIcon className="w-4 h-4 text-emerald-400" /> 1. Quadro Drag & Drop
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Arraste os cards entre as colunas (**Backlog, A Fazer, Em Progresso, Em Revisão, Concluído**). A transição do trabalho deve refletir o estado real em tempo real.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-rose-300">
                      <Flame className="w-4 h-4 text-rose-400" /> 2. Alertas de Violação de WIP
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Ajuste os limites de WIP pelo painel de controle. Se uma coluna ultrapassar o limite (ex: mais de 3 itens em progresso), o sistema emitirá alertas visuais de gargalo.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                      <Clock className="w-4 h-4 text-cyan-400" /> 3. Lead Time vs. Cycle Time
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Acompanhe o **Lead Time** (do pedido à entrega) e o **Cycle Time** (tempo de mão na massa). O objetivo é reduzir continuamente ambos os indicadores.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                      <BarChart3 className="w-4 h-4 text-purple-400" /> 4. Throughput (Vazão Semanal)
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Monitore quantos cards a equipe é capaz de entregar por semana de forma consistente e com alta qualidade.
                    </p>
                  </div>
                </div>
              </div>

              {/* Best fit & recommendations */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Quando Kanban é o mais recomendado?</h4>
                <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                  <li>Equipes de sustentação, suporte técnico, DevOps ou manutenção contínua.</li>
                  <li>Demandas com alta frequência de chamados não planejados que chegam a qualquer momento.</li>
                  <li>Processos que exigem fluxo constante sem interrupções por reuniões de planejamento de Sprint.</li>
                </ul>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-purple-400" />
            <span>Voce pode alterar a metodologia ativa do seu projeto a qualquer momento na barra superior.</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
};
