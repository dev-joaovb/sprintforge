import PageHeader from "../../../components/ui/PageHeader";
import Card from "../../../components/ui/Card";
import ProductBacklog from "../components/ProductBacklog";
import CurrentSprint from "../components/CurrentSprint";

const ScrumPage = () => {
return (
<>
<PageHeader title="Scrum" subtitle="Gerencie Product Backlog, Sprints e acompanhe a evolução do projeto." />

  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

    <Card>
      <div className="flex items-center justify-between mb-4">

        <h2 className="text-lg font-semibold">
          Product Backlog
        </h2>

        <span
          className="
            bg-slate-800
            text-slate-300
            text-xs
            px-2
            py-1
            rounded-full
          "
        >
          Stories
        </span>

      </div>

      <ProductBacklog />
    </Card>

    <Card>
      <CurrentSprint />
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