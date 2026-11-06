
export const PAIR_TIMER_CYCLE_SECONDS = 25 * 60;

export type PairTimerStatus = 'IDLE' | 'RUNNING' | 'PAUSED';

export interface PairTimerState {
  timerStatus: PairTimerStatus;
  timerRemainingSeconds: number;
  timerEndsAt: Date | null;
}

export function getRemainingSeconds(
  timer: PairTimerState,
  now: Date = new Date()
): number {
  if (timer.timerStatus !== 'RUNNING' || !timer.timerEndsAt) {
    return Math.max(0, timer.timerRemainingSeconds);
  }

  return Math.max(
    0,
    Math.ceil((timer.timerEndsAt.getTime() - now.getTime()) / 1000)
  );
}

export function startPairTimer(
  timer: PairTimerState,
  now: Date = new Date()
): PairTimerState {
  if (timer.timerStatus !== 'IDLE') {
    throw new Error('O cronômetro já foi iniciado.');
  }

  const seconds = PAIR_TIMER_CYCLE_SECONDS;

  return {
    timerStatus: 'RUNNING',
    timerRemainingSeconds: seconds,
    timerEndsAt: new Date(now.getTime() + seconds * 1000),
  };
}

export function pausePairTimer(
  timer: PairTimerState,
  now: Date = new Date()
): PairTimerState {
  if (timer.timerStatus !== 'RUNNING') {
    throw new Error('O cronômetro não está em execução.');
  }

  return {
    timerStatus: 'PAUSED',
    timerRemainingSeconds: getRemainingSeconds(timer, now),
    timerEndsAt: null,
  };
}

export function resumePairTimer(
  timer: PairTimerState,
  now: Date = new Date()
): PairTimerState {
  if (timer.timerStatus !== 'PAUSED') {
    throw new Error('O cronômetro não está pausado.');
  }

  if (timer.timerRemainingSeconds <= 0) {
    throw new Error('O ciclo já terminou.');
  }

  return {
    timerStatus: 'RUNNING',
    timerRemainingSeconds: timer.timerRemainingSeconds,
    timerEndsAt: new Date(
      now.getTime() + timer.timerRemainingSeconds * 1000
    ),
  };
}

export function resetPairTimer(): PairTimerState {
  return {
    timerStatus: 'IDLE',
    timerRemainingSeconds: PAIR_TIMER_CYCLE_SECONDS,
    timerEndsAt: null,
  };
}

export function canRotatePairRoles(
  timer: PairTimerState,
  now: Date = new Date()
): boolean {
  return (
    timer.timerStatus === 'RUNNING' &&
    getRemainingSeconds(timer, now) === 0
  );
}
