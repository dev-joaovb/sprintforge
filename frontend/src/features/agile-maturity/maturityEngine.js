export const calculateMaturity = (
  answers,
  maturityQuestions
) => {
  const pillarScores = {};

  let totalScore = 0;
  let totalQuestions = 0;

  maturityQuestions.forEach((pillarData) => {
    const pillarName = pillarData.pillar;

    let pillarTotal = 0;

    pillarData.questions.forEach((question) => {
      pillarTotal += Number(
        answers[question] || 1
      );

      totalQuestions++;
    });

    totalScore += pillarTotal;

    const pillarPercentage = Math.round(
      (pillarTotal /
        (pillarData.questions.length * 5)) *
        100
    );

    pillarScores[pillarName] =
      pillarPercentage;
  });

  const overallPercentage = Math.round(
    (totalScore / (totalQuestions * 5)) *
      100
  );

  let level = "";

  if (overallPercentage <= 20) {
    level = "Inicial";
  } else if (overallPercentage <= 40) {
    level = "Repetível";
  } else if (overallPercentage <= 60) {
    level = "Definido";
  } else if (overallPercentage <= 80) {
    level = "Gerenciado";
  } else {
    level = "Otimizado";
  }

  return {
    level,
    percentage: overallPercentage,
    pillars: pillarScores,
  };
};