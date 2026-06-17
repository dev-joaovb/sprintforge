export const calculateMaturity = (answers) => {
  const total = answers.reduce(
    (sum, value) => sum + Number(value),
    0
  );

  const percentage = (total / 25) * 100;

  let level = "";

  if (percentage <= 20) {
    level = "Inicial";
  } else if (percentage <= 40) {
    level = "Repetível";
  } else if (percentage <= 60) {
    level = "Definido";
  } else if (percentage <= 80) {
    level = "Gerenciado";
  } else {
    level = "Otimizado";
  }

  return {
    percentage: Math.round(percentage),
    level,
  };
};