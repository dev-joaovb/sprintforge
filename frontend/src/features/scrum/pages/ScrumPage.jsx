import PageHeader from "../../../components/ui/PageHeader";
import Card from "../../../components/ui/Card";

const ScrumPage = () => {
  return (
    <>
      <PageHeader
        title="Scrum"
        subtitle="Gerencie Product Backlog, Sprints e acompanhe a evolução do projeto."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <Card>
          <h2 className="text-lg font-semibold">
            Product Backlog
          </h2>

          <p className="text-slate-400 mt-2 text-sm">
            Gerencie as User Stories do produto.
          </p>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">
            Sprint Atual
          </h2>

          <p className="text-slate-400 mt-2 text-sm">
            Visualize o progresso da Sprint em andamento.
          </p>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">
            Métricas
          </h2>

          <p className="text-slate-400 mt-2 text-sm">
            Acompanhe indicadores importantes da Sprint.
          </p>
        </Card>

      </div>
    </>
  );
};

export default ScrumPage;