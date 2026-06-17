import { useState } from "react";

import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

import { calculateMaturity } from "./maturityEngine";

const AgileMaturityPage = () => {
  const [answers, setAnswers] = useState([
    3,
    3,
    3,
    3,
    3,
  ]);

  const [result, setResult] = useState(null);

  const questions = [
    "A equipe colabora bem entre si?",
    "Os processos são bem definidos?",
    "Existe planejamento frequente?",
    "A qualidade do produto é monitorada?",
    "As entregas acontecem regularmente?",
  ];

  const handleChange = (index, value) => {
    const updated = [...answers];

    updated[index] = Number(value);

    setAnswers(updated);
  };

  const handleCalculate = () => {
    const maturity = calculateMaturity(answers);

    setResult(maturity);
  };

  return (
    <>
      <PageHeader
        title="Maturidade Ágil"
        subtitle="Avalie o nível de maturidade da sua equipe."
      />

      <Card>
        <div className="space-y-6">

          {questions.map((question, index) => (
            <div key={index}>
              <label className="block mb-2 font-medium">
                {question}
              </label>

              <select
                value={answers[index]}
                onChange={(e) =>
                  handleChange(index, e.target.value)
                }
                className="w-full bg-slate-800 p-3 rounded-lg"
              >
                <option value="1">1 - Muito fraco</option>
                <option value="2">2 - Fraco</option>
                <option value="3">3 - Regular</option>
                <option value="4">4 - Bom</option>
                <option value="5">5 - Excelente</option>
              </select>
            </div>
          ))}

          <Button onClick={handleCalculate}>
            Avaliar Maturidade
          </Button>

        </div>
      </Card>

      {result && (
        <div className="mt-6">
          <Card>

            <h2 className="text-2xl font-bold text-blue-500">
              {result.level}
            </h2>

            <p className="mt-3 text-slate-300">
              Nível de maturidade encontrado.
            </p>

            <div className="mt-4">

              <div className="flex justify-between mb-2">
                <span>Score</span>
                <span>{result.percentage}%</span>
              </div>

              <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-500"
                  style={{
                    width: `${result.percentage}%`,
                  }}
                />
              </div>

            </div>

          </Card>
        </div>
      )}
    </>
  );
};

export default AgileMaturityPage;