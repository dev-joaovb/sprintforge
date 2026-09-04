export const generateInsights = (pillars) => {
  const entries = Object.entries(pillars);

  const strongest = [...entries]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const weakest = [...entries]
    .sort((a, b) => a[1] - b[1])
    .slice(0, 3);

  const recommendations = [];

  weakest.forEach(([pillar]) => {
    switch (pillar) {
      case "Pessoas":
        recommendations.push(
          "Promover maior colaboração entre os membros da equipe."
        );
        break;

      case "Processos":
        recommendations.push(
          "Documentar e padronizar os processos de trabalho."
        );
        break;

      case "Planejamento":
        recommendations.push(
          "Fortalecer backlog, priorização e planejamento contínuo."
        );
        break;

      case "Qualidade":
        recommendations.push(
          "Investir em testes, revisões e monitoramento de defeitos."
        );
        break;

      case "Entrega":
        recommendations.push(
          "Melhorar previsibilidade e frequência das entregas."
        );
        break;

      case "Métricas":
        recommendations.push(
          "Implantar indicadores como Lead Time, Cycle Time e Throughput."
        );
        break;

      case "Cliente":
        recommendations.push(
          "Aumentar a participação do cliente e coleta de feedback."
        );
        break;

      case "Cultura Ágil":
        recommendations.push(
          "Estimular retrospectivas e melhoria contínua."
        );
        break;

      default:
        break;
    }
  });

  return {
    strongest,
    weakest,
    recommendations,
  };
};