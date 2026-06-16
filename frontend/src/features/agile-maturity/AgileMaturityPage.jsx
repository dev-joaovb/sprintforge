import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";

const AgileMaturityPage = () => {
  return (
    <>
      <PageHeader
        title="Maturidade Ágil"
        subtitle="Avalie o nível de maturidade ágil da sua equipe."
      />

      <Card>
        <p className="text-slate-300">
          Em breve você poderá responder um questionário para descobrir
          o nível de maturidade ágil da sua organização.
        </p>

        <div className="mt-6">
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="font-semibold">
              Níveis previstos
            </h3>

            <ul className="mt-3 space-y-2 text-slate-400">
              <li>• Inicial</li>
              <li>• Repetível</li>
              <li>• Definido</li>
              <li>• Gerenciado</li>
              <li>• Otimizado</li>
            </ul>
          </div>
        </div>
      </Card>
    </>
  );
};

export default AgileMaturityPage;
