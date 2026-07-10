import Card from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";

import { useAgile } from "../../context/AgileContext";
import { useKanban } from "../../context/KanbanContext";

const DashboardPage = () => {
  const { agileData } = useAgile();
  const { totalTasks, backlogTasks, todoTasks, inProgressTasks, reviewTasks, doneTasks, criticalTasks } = useKanban();

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral dos seus projetos ágeis."
      />

      {/* Indicadores principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        <Card>
          <h3 className="text-slate-400 text-sm">
            Metodologia Recomendada
          </h3>

          <p className="text-3xl font-bold mt-2">
            {agileData.recommendedMethodology ||
              "Não avaliada"}
          </p>
        </Card>

        <Card>
          <h3 className="text-slate-400 text-sm">
            Maturidade Atual
          </h3>

          <p className="text-3xl font-bold mt-2">
            {agileData.maturity.percentage || 0}%
          </p>

          <p className="text-green-400 text-sm mt-2">
            {agileData.maturity.level ||
              "Não avaliada"}
          </p>
        </Card>

        <Card>
          <h3 className="text-slate-400 text-sm">
            Principal Força
          </h3>

          <p className="text-3xl font-bold mt-2">
            {agileData.strongest ||
              "Não identificada"}
          </p>
        </Card>

        <Card>
          <h3 className="text-slate-400 text-sm">
            Principal Fraqueza
          </h3>

          <p className="text-3xl font-bold mt-2">
            {agileData.weakest ||
              "Não identificada"}
          </p>
        </Card>

      </div>

      {/* Resumo Executivo */}

      {/* Indicadores do Kanban */}
      <div className="mt-6">

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

          <Card>
            <h3 className="text-slate-400 text-sm">
              Total de Tarefas
            </h3>

            <p className="text-3xl font-bold mt-2">
              {totalTasks}
            </p>
          </Card>

          <Card>
            <h3 className="text-slate-400 text-sm">
              Backlog
            </h3>

            <p className="text-3xl font-bold mt-2">
              {backlogTasks}
            </p>
          </Card>

          <Card>
            <h3 className="text-slate-400 text-sm">
              Em Andamento
            </h3>

            <p className="text-3xl font-bold mt-2">
              {inProgressTasks}
            </p>
          </Card>

          <Card>
            <h3 className="text-slate-400 text-sm">
              Concluídas
            </h3>

            <p className="text-3xl font-bold mt-2">
              {doneTasks}
            </p>
          </Card>

        </div>

      </div>

      <div className="mt-6">

        <Card>

          <h2 className="text-xl font-semibold mb-4">
            Resumo Executivo
          </h2>

          <p className="text-slate-300 leading-relaxed">

            {agileData.maturity.level
              ? `
              Sua equipe encontra-se atualmente no nível
              ${agileData.maturity.level} de maturidade ágil.
              O principal ponto forte identificado foi
              ${agileData.strongest},
              enquanto o principal ponto de atenção é
              ${agileData.weakest}.
            `
              : `
              Nenhum diagnóstico foi realizado ainda.
              Utilize o módulo de Maturidade Ágil para
              gerar uma análise completa da equipe.
            `}

          </p>

        </Card>

      </div>

      {/* Recomendações */}
      <div className="mt-6">

        <Card>

          <h2 className="text-xl font-semibold mb-4">
            Próximas Recomendações
          </h2>

          {agileData.recommendations.length > 0 ? (

            <ul className="space-y-3 text-slate-300">

              {agileData.recommendations.map(
                (recommendation, index) => (
                  <li key={index}>
                    • {recommendation}
                  </li>
                )
              )}

            </ul>

          ) : (

            <p className="text-slate-400">
              Nenhuma recomendação disponível.
            </p>

          )}

        </Card>

      </div>

    </>
  );
};

export default DashboardPage;