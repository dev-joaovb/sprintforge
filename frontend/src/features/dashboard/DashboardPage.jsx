import Card from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";

const DashboardPage = () => {
  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral dos seus projetos ágeis."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        <Card>
          <h3 className="text-slate-400">
            Projetos Ativos
          </h3>

          <p className="text-3xl font-bold mt-2">
            8
          </p>
        </Card>

        <Card>
          <h3 className="text-slate-400">
            Projetos Ativos
          </h3>

          <p className="text-3xl font-bold mt-2">
            8
          </p>
        </Card>


      </div>
    </>
  );
};

export default DashboardPage;