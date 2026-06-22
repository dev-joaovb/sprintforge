import Card from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";

const DashboardPage = () => {
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
            Scrum
          </p>
        </Card>

        <Card>
          <h3 className="text-slate-400 text-sm">
            Maturidade Atual
          </h3>

          <p className="text-3xl font-bold mt-2">
            78%
          </p>

          <p className="text-green-400 text-sm mt-2">
            Gerenciado
          </p>
        </Card>

        <Card>
          <h3 className="text-slate-400 text-sm">
            Principal Força
          </h3>

          <p className="text-3xl font-bold mt-2">
            Pessoas
          </p>

          <p className="text-green-400 text-sm mt-2">
            90%
          </p>
        </Card>

        <Card>
          <h3 className="text-slate-400 text-sm">
            Principal Fraqueza
          </h3>

          <p className="text-3xl font-bold mt-2">
            Métricas
          </p>

          <p className="text-yellow-400 text-sm mt-2">
            45%
          </p>
        </Card>

      </div>

      {/* Resumo Executivo */}
      <div className="mt-6">

        <Card>

          <h2 className="text-xl font-semibold mb-4">
            Resumo Executivo
          </h2>

          <p className="text-slate-300 leading-relaxed">
            Sua equipe demonstra uma boa maturidade
            ágil, com destaque para colaboração,
            qualidade e cultura de melhoria contínua.
            Os principais pontos de atenção estão na
            utilização de métricas para tomada de
            decisão e no acompanhamento dos
            indicadores de desempenho.
          </p>

        </Card>

      </div>

      {/* Plano de ação */}
      <div className="mt-6">

        <Card>

          <h2 className="text-xl font-semibold mb-4">
            Próximas Recomendações
          </h2>

          <ul className="space-y-3 text-slate-300">

            <li>
              • Implantar métricas de Lead Time e
              Cycle Time.
            </li>

            <li>
              • Criar dashboard de acompanhamento
              das entregas.
            </li>

            <li>
              • Realizar retrospectivas focadas em
              indicadores.
            </li>

            <li>
              • Acompanhar evolução da maturidade
              mensalmente.
            </li>

          </ul>

        </Card>

      </div>
    </>
  );
};

export default DashboardPage;