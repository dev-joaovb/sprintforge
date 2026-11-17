import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getSessionElapsedSeconds,
  pauseSessionTimer,
  resumeSessionTimer,
  finishSessionTimer,
  type SessionTimeState,
} from '../services/xp-session-time.service';

const startTime = new Date('2026-01-01T12:00:00.000Z');

test('calcula o tempo efetivo de uma sessão em execução', () => {
  const session: SessionTimeState = {
    sessionTimerStatus: 'RUNNING',
    sessionElapsedSeconds: 0,
    sessionTimerStartedAt: startTime,
  };

  const now = new Date('2026-01-01T12:05:00.000Z');

  assert.equal(getSessionElapsedSeconds(session, now), 300);
});

test('mantém o tempo acumulado enquanto a sessão está pausada', () => {
  const session: SessionTimeState = {
    sessionTimerStatus: 'PAUSED',
    sessionElapsedSeconds: 300,
    sessionTimerStartedAt: null,
  };

  const now = new Date('2026-01-01T12:30:00.000Z');

  assert.equal(getSessionElapsedSeconds(session, now), 300);
});

test('pausa a sessão e preserva o tempo efetivamente trabalhado', () => {
  const session: SessionTimeState = {
    sessionTimerStatus: 'RUNNING',
    sessionElapsedSeconds: 120,
    sessionTimerStartedAt: startTime,
  };

  const paused = pauseSessionTimer(
    session,
    new Date('2026-01-01T12:05:00.000Z')
  );

  assert.equal(paused.sessionTimerStatus, 'PAUSED');
  assert.equal(paused.sessionElapsedSeconds, 420);
  assert.equal(paused.sessionTimerStartedAt, null);
});

test('retoma a sessão sem contabilizar o período pausado', () => {
  const paused: SessionTimeState = {
    sessionTimerStatus: 'PAUSED',
    sessionElapsedSeconds: 420,
    sessionTimerStartedAt: null,
  };

  const resumed = resumeSessionTimer(
    paused,
    new Date('2026-01-01T13:00:00.000Z')
  );

  assert.equal(resumed.sessionTimerStatus, 'RUNNING');
  assert.equal(resumed.sessionElapsedSeconds, 420);
  assert.equal(
    resumed.sessionTimerStartedAt?.toISOString(),
    '2026-01-01T13:00:00.000Z'
  );

  assert.equal(
    getSessionElapsedSeconds(
      resumed,
      new Date('2026-01-01T13:03:00.000Z')
    ),
    600
  );
});

test('impede pausar um cronômetro que já está pausado', () => {
  const session: SessionTimeState = {
    sessionTimerStatus: 'PAUSED',
    sessionElapsedSeconds: 300,
    sessionTimerStartedAt: null,
  };

  assert.throws(
    () => pauseSessionTimer(session, startTime),
    /não está em execução/
  );
});

test('impede retomar um cronômetro que já está em execução', () => {
  const session: SessionTimeState = {
    sessionTimerStatus: 'RUNNING',
    sessionElapsedSeconds: 0,
    sessionTimerStartedAt: startTime,
  };

  assert.throws(
    () => resumeSessionTimer(session, startTime),
    /não está pausado/
  );
});

test('encerra o cronômetro e congela o tempo efetivamente trabalhado', () => {
  const session: SessionTimeState = {
    sessionTimerStatus: 'RUNNING',
    sessionElapsedSeconds: 120,
    sessionTimerStartedAt: startTime,
  };

  const completed = finishSessionTimer(
    session,
    new Date('2026-01-01T12:05:00.000Z')
  );

  assert.equal(completed.sessionTimerStatus, 'PAUSED');
  assert.equal(completed.sessionElapsedSeconds, 420);
  assert.equal(completed.sessionTimerStartedAt, null);

  assert.equal(
    getSessionElapsedSeconds(
      completed,
      new Date('2026-01-01T14:00:00.000Z')
    ),
    420
  );
});
