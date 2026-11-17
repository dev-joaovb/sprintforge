export type SessionTimerStatus = 'RUNNING' | 'PAUSED';

export interface SessionTimeState {
  sessionTimerStatus: SessionTimerStatus;
  sessionElapsedSeconds: number;
  sessionTimerStartedAt: Date | null;
}

export function getSessionElapsedSeconds(
  session: SessionTimeState,
  now: Date = new Date()
): number {
  const accumulatedSeconds = Math.max(
    0,
    session.sessionElapsedSeconds
  );

  if (
    session.sessionTimerStatus !== 'RUNNING' ||
    !session.sessionTimerStartedAt
  ) {
    return accumulatedSeconds;
  }

  const elapsedMilliseconds =
    now.getTime() - session.sessionTimerStartedAt.getTime();

  const currentIntervalSeconds = Math.max(
    0,
    Math.floor(elapsedMilliseconds / 1000)
  );

  return accumulatedSeconds + currentIntervalSeconds;
}

export function pauseSessionTimer(
  session: SessionTimeState,
  now: Date = new Date()
): SessionTimeState {
  if (
    session.sessionTimerStatus !== 'RUNNING' ||
    !session.sessionTimerStartedAt
  ) {
    throw new Error('O cronômetro da sessão não está em execução.');
  }

  return {
    sessionTimerStatus: 'PAUSED',
    sessionElapsedSeconds: getSessionElapsedSeconds(session, now),
    sessionTimerStartedAt: null,
  };
}

export function resumeSessionTimer(
  session: SessionTimeState,
  now: Date = new Date()
): SessionTimeState {
  if (session.sessionTimerStatus !== 'PAUSED') {
    throw new Error('O cronômetro da sessão não está pausado.');
  }

  return {
    sessionTimerStatus: 'RUNNING',
    sessionElapsedSeconds: session.sessionElapsedSeconds,
    sessionTimerStartedAt: now,
  };
}

export function finishSessionTimer(
  session: SessionTimeState,
  now: Date = new Date()
): SessionTimeState {
  return {
    sessionTimerStatus: 'PAUSED',
    sessionElapsedSeconds: getSessionElapsedSeconds(session, now),
    sessionTimerStartedAt: null,
  };
}
