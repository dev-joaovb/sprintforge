/**
 * Worker TDD executado dentro de um contêiner Docker Rootless.
 *
 * O código recebido é não confiável e deve ser executado somente
 * dentro do ambiente isolado configurado pelo executor.
 */
export const TDD_WORKER_SOURCE = String.raw`
'use strict';

const fs = require('node:fs');
const { spawn } = require('node:child_process');

const MAX_SNIPPET_BYTES = 16_384;
const EXECUTION_TIMEOUT_MS = 3000;
const TEST_FILE = '/tmp/xp06-user-test.cjs';
const REPORTER_FILE = '/tmp/xp06-reporter.mjs';
const REPORTER_BASE64 = 'Cid1c2Ugc3RyaWN0JzsKCmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uKiByZXBvcnRlcihzb3VyY2UpIHsKICBjb25zdCByZXBvcnQgPSB7CiAgICB2ZXJzaW9uOiAxLAogICAgc3VjY2VzczogZmFsc2UsCiAgICB0ZXN0czogMCwKICAgIHBhc3NlZDogMCwKICAgIGZhaWxlZDogMCwKICAgIHNraXBwZWQ6IDAsCiAgICB0b2RvOiAwLAogICAgY2FuY2VsbGVkOiAwLAogICAgYXNzZXJ0aW9uRmFpbHVyZXM6IDAsCiAgfTsKCiAgZm9yIGF3YWl0IChjb25zdCBldmVudCBvZiBzb3VyY2UpIHsKICAgIC8vIElnbm9yYSBvIGV2ZW50byBkZSBjb25jbHVzw6NvIGRvIGFycXVpdm8gZW1pdGlkbyBwZWxvIG5vZGU6dGVzdC4KICAgIC8vIEVzc2UgZXZlbnRvIHBvZGUgc2VyIFBBU1MgbWVzbW8gc2VtIG5lbmh1bSB0ZXN0KCkgcmVnaXN0cmFkby4KICAgIGlmICgKICAgICAgKGV2ZW50LnR5cGUgPT09ICd0ZXN0OnBhc3MnIHx8IGV2ZW50LnR5cGUgPT09ICd0ZXN0OmZhaWwnKSAmJgogICAgICBldmVudC5kYXRhPy5uYW1lID09PSBldmVudC5kYXRhPy5maWxlCiAgICApIHsKICAgICAgY29udGludWU7CiAgICB9CgogICAgaWYgKGV2ZW50LnR5cGUgPT09ICd0ZXN0OnBhc3MnKSB7CiAgICAgIGlmIChldmVudC5kYXRhPy5za2lwKSB7CiAgICAgICAgcmVwb3J0LnNraXBwZWQrKzsKICAgICAgfSBlbHNlIGlmIChldmVudC5kYXRhPy50b2RvKSB7CiAgICAgICAgcmVwb3J0LnRvZG8rKzsKICAgICAgfSBlbHNlIHsKICAgICAgICByZXBvcnQucGFzc2VkKys7CiAgICAgIH0KCiAgICAgIHJlcG9ydC50ZXN0cysrOwogICAgfQoKICAgIGlmIChldmVudC50eXBlID09PSAndGVzdDpmYWlsJykgewogICAgICByZXBvcnQudGVzdHMrKzsKICAgICAgcmVwb3J0LmZhaWxlZCsrOwoKICAgICAgY29uc3QgZXJyb3IgPSBldmVudC5kYXRhPy5kZXRhaWxzPy5lcnJvcjsKCiAgICAgIGlmICgKICAgICAgICBlcnJvcj8uY29kZSA9PT0gJ0VSUl9URVNUX0ZBSUxVUkUnICYmCiAgICAgICAgZXJyb3I/LmNhdXNlPy5jb2RlID09PSAnRVJSX0FTU0VSVElPTicKICAgICAgKSB7CiAgICAgICAgcmVwb3J0LmFzc2VydGlvbkZhaWx1cmVzKys7CiAgICAgIH0KICAgIH0KICB9CgogIHJlcG9ydC5zdWNjZXNzID0gKAogICAgcmVwb3J0LnRlc3RzID4gMCAmJgogICAgcmVwb3J0LmZhaWxlZCA9PT0gMCAmJgogICAgcmVwb3J0LnNraXBwZWQgPT09IDAgJiYKICAgIHJlcG9ydC50b2RvID09PSAwICYmCiAgICByZXBvcnQuY2FuY2VsbGVkID09PSAwCiAgKTsKCiAgeWllbGQgSlNPTi5zdHJpbmdpZnkocmVwb3J0KSArICdcbic7Cn0K';

let received = Buffer.alloc(0);
let rejected = false;
let finished = false;

function report(overrides = {}) {
  return {
    version: 1,
    success: false,
    tests: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    todo: 0,
    cancelled: 0,
    assertionFailures: 0,
    ...overrides,
  };
}

function finish(result, exitCode = 1) {
  if (finished) return;
  finished = true;

  process.stdout.write(JSON.stringify(result) + '\n');
  process.exitCode = exitCode;

  try {
    fs.unlinkSync(TEST_FILE);
  } catch {}

  try {
    fs.unlinkSync(REPORTER_FILE);
  } catch {}
}

process.stdin.on('data', chunk => {
  if (rejected) return;

  if (chunk.length > MAX_SNIPPET_BYTES - received.length) {
    rejected = true;
    received = Buffer.alloc(0);
    finish(report());
    process.stdin.destroy();
    return;
  }

  received = Buffer.concat([received, chunk]);
});

process.stdin.on('error', () => {
  finish(report());
});

process.stdin.on('end', () => {
  if (rejected || finished) return;

  const snippet = received.toString('utf8');

  if (!snippet.trim()) {
    finish(report());
    return;
  }

  try {
    fs.writeFileSync(
      REPORTER_FILE,
      Buffer.from(REPORTER_BASE64, 'base64'),
      { flag: 'wx', mode: 0o600 }
    );

    fs.writeFileSync(TEST_FILE, snippet, {
      encoding: 'utf8',
      flag: 'wx',
      mode: 0o600,
    });
  } catch {
    finish(report());
    return;
  }

  const child = spawn(process.execPath, [
    '--test',
    '--test-reporter=' + REPORTER_FILE,
    TEST_FILE,
  ], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      PATH: process.env.PATH || '/usr/local/bin:/usr/bin:/bin',
      HOME: '/tmp',
    },
  });

  let stdout = '';
  let stderr = '';
  let timedOut = false;
  let outputExceeded = false;

  const timer = setTimeout(() => {
    timedOut = true;
    child.kill('SIGKILL');
  }, EXECUTION_TIMEOUT_MS);

  child.stdout.on('data', chunk => {
    stdout += chunk.toString();

    if (stdout.length > 65536) {
      outputExceeded = true;
      child.kill('SIGKILL');
    }
  });

  child.stderr.on('data', chunk => {
    stderr += chunk.toString();

    if (stderr.length > 65536) {
      outputExceeded = true;
      child.kill('SIGKILL');
    }
  });

  child.on('error', () => {
    clearTimeout(timer);
    finish(report());
  });

  child.on('close', code => {
    clearTimeout(timer);

    if (finished) return;

    if (timedOut) {
      finish(report(), 124);
      return;
    }

    if (outputExceeded) {
      finish(report());
      return;
    }

    try {
      const parsed = JSON.parse(stdout.trim());

      if (
        parsed.version !== 1 ||
        !Number.isSafeInteger(parsed.tests) ||
        !Number.isSafeInteger(parsed.passed) ||
        !Number.isSafeInteger(parsed.failed) ||
        !Number.isSafeInteger(parsed.skipped) ||
        !Number.isSafeInteger(parsed.todo) ||
        !Number.isSafeInteger(parsed.cancelled) ||
        !Number.isSafeInteger(parsed.assertionFailures)
      ) {
        finish(report());
        return;
      }

      const success = (
        code === 0 &&
        parsed.success === true &&
        parsed.tests > 0 &&
        parsed.passed === parsed.tests
      );

      finish({ ...parsed, success }, success ? 0 : 1);
    } catch {
      finish(report());
    }
  });
});
`;
