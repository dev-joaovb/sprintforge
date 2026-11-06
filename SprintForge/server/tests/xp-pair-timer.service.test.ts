
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  PAIR_TIMER_CYCLE_SECONDS,
  getRemainingSeconds,
  startPairTimer,
  pausePairTimer,
  resumePairTimer,
  resetPairTimer,
  canRotatePairRoles,
  type PairTimerState,
} from '../services/xp-pair-timer.service';

const initialTimer: PairTimerState = {
  timerStatus: 'IDLE',
  timerRemainingSeconds: PAIR_TIMER_CYCLE_SECONDS,
  timerEndsAt: null,
};

const startTime = new Date('2026-01-01T12:00:00.000Z');

test('inicia o cronômetro com 25 minutos', () => {
  const result = startPairTimer(initialTimer, startTime);

  assert.equal(result.timerStatus, 'RUNNING');
  assert.equal(result.timerRemainingSeconds, 1500);
  assert.equal(
    result.timerEndsAt?.toISOString(),
    '2026-01-01T12:25:00.000Z'
  );
});

test('calcula o tempo restante durante a execução', () => {
  const timer = startPairTimer(initialTimer, startTime);

  const now = new Date('2026-01-01T12:10:00.000Z');

  assert.equal(getRemainingSeconds(timer, now), 900);
});

test('pausa o cronômetro preservando o tempo restante', () => {
  const timer = startPairTimer(initialTimer, startTime);
  const now = new Date('2026-01-01T12:05:00.000Z');

  const paused = pausePairTimer(timer, now);

  assert.equal(paused.timerStatus, 'PAUSED');
  assert.equal(paused.timerRemainingSeconds, 1200);
  assert.equal(paused.timerEndsAt, null);
});

test('retoma o cronômetro a partir do tempo preservado', () => {
  const timer = startPairTimer(initialTimer, startTime);
  const paused = pausePairTimer(
    timer,
    new Date('2026-01-01T12:05:00.000Z')
  );

  const resumed = resumePairTimer(
    paused,
    new Date('2026-01-01T13:00:00.000Z')
  );

  assert.equal(resumed.timerStatus, 'RUNNING');
  assert.equal(
    resumed.timerEndsAt?.toISOString(),
    '2026-01-01T13:20:00.000Z'
  );
});

test('reinicia o cronômetro para 25 minutos', () => {
  const result = resetPairTimer();

  assert.deepEqual(result, initialTimer);
});

test('impede iniciar um cronômetro já iniciado', () => {
  const timer = startPairTimer(initialTimer, startTime);

  assert.throws(
    () => startPairTimer(timer, startTime),
    /já foi iniciado/
  );
});

test('impede pausar um cronômetro parado', () => {
  assert.throws(
    () => pausePairTimer(initialTimer, startTime),
    /não está em execução/
  );
});

test('impede retomar um cronômetro não pausado', () => {
  assert.throws(
    () => resumePairTimer(initialTimer, startTime),
    /não está pausado/
  );
});

test('permite alternar os papéis após o término do ciclo', () => {
  const timer = startPairTimer(initialTimer, startTime);

  assert.equal(
    canRotatePairRoles(timer, new Date('2026-01-01T12:25:00.000Z')),
    true
  );
});

test('impede alternar os papéis antes do término do ciclo', () => {
  const timer = startPairTimer(initialTimer, startTime);

  assert.equal(
    canRotatePairRoles(timer, new Date('2026-01-01T12:24:59.000Z')),
    false
  );
});
