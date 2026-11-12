export const XP_SESSION_MIN_MINUTES = 10;
export const XP_SESSION_MAX_MINUTES = 90;
export const XP_SESSION_STEP_MINUTES = 5;
export const XP_SESSION_DEFAULT_MINUTES = 30;

export function validateXpSessionDuration(value: unknown): number {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value) ||
    !Number.isInteger(value) ||
    value < XP_SESSION_MIN_MINUTES ||
    value > XP_SESSION_MAX_MINUTES ||
    value % XP_SESSION_STEP_MINUTES !== 0
  ) {
    throw new Error(
      'Duração inválida: escolha entre 10 e 90 minutos, em intervalos de 5 minutos.'
    );
  }

  return value;
}
