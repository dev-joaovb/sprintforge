export const recommendMethodology = ({
  teamSize,
  changingRequirements,
  continuousDelivery,
}) => {
  // XP
  if (
    continuousDelivery === "yes" &&
    changingRequirements === "yes" &&
    teamSize <= 10
  ) {
    return {
      methodology: "Extreme Programming (XP)",
      description:
        "Ideal para equipes pequenas que trabalham com mudanças frequentes e entregas contínuas."
    };
  }

  // Scrum
  if (
    teamSize >= 5 &&
    teamSize <= 10 &&
    changingRequirements === "no"
  ) {
    return {
      methodology: "Scrum",
      description:
        "Excelente para equipes organizadas em Sprints e com requisitos relativamente estáveis."
    };
  }

  // Kanban
  if (
    continuousDelivery === "yes" &&
    changingRequirements === "yes"
  ) {
    return {
      methodology: "Kanban",
      description:
        "Indicado para fluxo contínuo de trabalho e adaptação constante."
    };
  }

  // Scrumban
  return {
    methodology: "Scrumban",
    description:
      "Combina previsibilidade do Scrum com a flexibilidade do Kanban."
  };
};