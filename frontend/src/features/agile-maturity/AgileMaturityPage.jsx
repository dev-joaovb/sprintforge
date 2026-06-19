import { useState } from "react";

import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

import { maturityQuestions } from "./maturityQuestions";
import { calculateMaturity } from "./maturityEngine";
import { generateInsights } from "./maturityInsights";

const AgileMaturityPage = () => {
  const initialAnswers = {};

  maturityQuestions.forEach((pillar) => {
    pillar.questions.forEach((question) => {
      initialAnswers[question] = 3;
    });
  });

  const [answers, setAnswers] =
    useState(initialAnswers);

  const [result, setResult] =
    useState(null);

  const handleChange = (
    question,
    value
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [question]: Number(value),
    }));
  };

  const handleCalculate = () => {
    const maturity = calculateMaturity(
        answers,
        maturityQuestions
    );

    const insights = generateInsights(
        maturity.pillars
    );

    setResult({
        ...maturity,
        ...insights,
    });
};

  return (
    <>
      <PageHeader
        title="Maturidade Ágil"
        subtitle="Avalie o nível de maturidade da sua equipe."
      />

      <Card>

        <div className="space-y-8">

          {maturityQuestions.map(
            (pillar, pillarIndex) => (
              <div key={pillarIndex}>

                <h3 className="text-lg font-semibold text-blue-500 mb-4">
                  {pillar.pillar}
                </h3>

                <div className="space-y-4">

                  {pillar.questions.map(
                    (question, questionIndex) => (
                      <div key={questionIndex}>

                        <label className="block mb-2">
                          {question}
                        </label>

                        <select
                          value={
                            answers[question]
                          }
                          onChange={(e) =>
                            handleChange(
                              question,
                              e.target.value
                            )
                          }
                          className="w-full bg-slate-800 p-3 rounded-lg"
                        >
                          <option value="1">
                            1 - Muito fraco
                          </option>

                          <option value="2">
                            2 - Fraco
                          </option>

                          <option value="3">
                            3 - Regular
                          </option>

                          <option value="4">
                            4 - Bom
                          </option>

                          <option value="5">
                            5 - Excelente
                          </option>
                        </select>

                      </div>
                    )
                  )}

                </div>

              </div>
            )
          )}

          <Button
            onClick={handleCalculate}
          >
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

            <p className="mt-2 text-slate-300">
              Maturidade Geral
            </p>

            <div className="mt-4">

              <div className="flex justify-between mb-2">
                <span>Score Geral</span>
                <span>
                  {result.percentage}%
                </span>
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

          <div className="mt-6">

            <Card>

              <h3 className="text-xl font-semibold mb-6">
                Resultado por Pilar
              </h3>

              <div className="space-y-4">

                {Object.entries(
                  result.pillars
                ).map(
                  ([pillar, score]) => (
                    <div key={pillar}>

                      <div className="flex justify-between mb-2">
                        <span>{pillar}</span>
                        <span>{score}%</span>
                      </div>

                      <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{
                            width: `${score}%`,
                          }}
                        />
                      </div>

                    </div>
                  )
                )}

              </div>

            </Card>

          </div>

            <div className="mt-6">

                <Card>

                    <h3 className="text-xl font-semibold text-green-400 mb-4">
                    Pontos Fortes
                    </h3>

                    <ul className="space-y-3">

                    {result.strongest.map(
                        ([pillar, score]) => (
                        <li
                            key={pillar}
                            className="flex justify-between"
                        >
                            <span>
                            ✓ {pillar}
                            </span>

                            <span>
                            {score}%
                            </span>
                        </li>
                        )
                    )}

                    </ul>

                </Card>

            </div>

            <div className="mt-6">

                <Card>

                    <h3 className="text-xl font-semibold text-yellow-400 mb-4">
                    Pontos de Atenção
                    </h3>

                    <ul className="space-y-3">

                    {result.weakest.map(
                        ([pillar, score]) => (
                        <li
                            key={pillar}
                            className="flex justify-between"
                        >
                            <span>
                            ⚠ {pillar}
                            </span>

                            <span>
                            {score}%
                            </span>
                        </li>
                        )
                    )}

                    </ul>

                </Card>

            </div>

            <div className="mt-6">

                <Card>

                    <h3 className="text-xl font-semibold text-blue-400 mb-4">
                    Plano de Ação Recomendado
                    </h3>

                    <ul className="space-y-3">

                    {result.recommendations.map(
                        (recommendation, index) => (
                        <li key={index}>
                            • {recommendation}
                        </li>
                        )
                    )}

                    </ul>

                </Card>

            </div>

        </div>

      )}
    </>
  );
};

export default AgileMaturityPage;