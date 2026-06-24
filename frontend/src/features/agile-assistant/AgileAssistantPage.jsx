import { useState } from "react";

import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

import { useAgile } from "../../context/AgileContext";  // Import the useAgile hook to access the Agile context

import { recommendMethodology } from "./methodologyEngine";


const AgileAssistantPage = () => {
  const [teamSize, setTeamSize] = useState(5);
  const [changingRequirements, setChangingRequirements] =
  useState("yes");
  
  const [continuousDelivery, setContinuousDelivery] =
  useState("yes");
  
  const [result, setResult] = useState(null);
  
  const { agileData, setAgileData } = useAgile();

    const handleAnalyze = () => {
      const recommendation =
        recommendMethodology({
          teamSize,
          changingRequirements,
          continuousDelivery,
        });

      setResult(recommendation);

      setAgileData({
        ...agileData,

        recommendedMethodology:
          recommendation.methodology,
      });
    };

  return (
    <>
      <PageHeader
        title="Assistente Ágil"
        subtitle="Descubra qual metodologia é mais adequada para seu projeto."
      />

      <Card>
        <div className="space-y-6">

          <div>
            <label className="block mb-2 font-medium">
              Quantas pessoas há na equipe?
            </label>

            <input
              type="number"
              min="1"
              value={teamSize}
              onChange={(e) =>
                setTeamSize(Number(e.target.value))
              }
              className="w-full bg-slate-800 rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Os requisitos mudam frequentemente?
            </label>

            <select
              value={changingRequirements}
              onChange={(e) =>
                setChangingRequirements(e.target.value)
              }
              className="w-full bg-slate-800 rounded-lg p-3"
            >
              <option value="yes">Sim</option>
              <option value="no">Não</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Existe entrega contínua?
            </label>

            <select
              value={continuousDelivery}
              onChange={(e) =>
                setContinuousDelivery(e.target.value)
              }
              className="w-full bg-slate-800 rounded-lg p-3"
            >
              <option value="yes">Sim</option>
              <option value="no">Não</option>
            </select>
          </div>

          <Button onClick={handleAnalyze}>
            Analisar Metodologia
          </Button>

        </div>
      </Card>

      {result && (
        <div className="mt-6">
          <Card>

            <h2 className="text-2xl font-bold text-blue-500">
              {result.methodology}
            </h2>

            <p className="mt-4 text-slate-300">
              {result.description}
            </p>

          </Card>
        </div>
      )}
    </>
  );
};

export default AgileAssistantPage;