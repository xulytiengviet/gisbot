import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/worker.js';

const base = 'https://gisbot.example';
const env = {
  ASSETS: {
    async fetch() {
      return new Response('<h1>GISBot</h1>', {
        status: 200,
        headers: { 'content-type': 'text/html; charset=utf-8' },
      });
    },
  },
};

test('Workers entry serves real health handler', async () => {
  const response = await worker.fetch(new Request(base + '/api/health'), env, {});
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.ok, true);
  assert.equal(data.service, 'GISBot');
});

test('Workers entry prevents SPA fallback for unknown APIs', async () => {
  const response = await worker.fetch(new Request(base + '/api/does-not-exist'), env, {});
  assert.equal(response.status, 404);
  assert.match(response.headers.get('content-type'), /application\/json/);
});

test('Workers entry rejects wrong HTTP method', async () => {
  const response = await worker.fetch(new Request(base + '/api/health', { method: 'POST' }), env, {});
  assert.equal(response.status, 405);
  assert.equal(response.headers.get('allow'), 'GET');
});

test('Workers entry keeps existing chat origin protection', async () => {
  const response = await worker.fetch(new Request(base + '/api/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://evil.example' },
    body: JSON.stringify({ messages: [{ role: 'user', content: 'Hello' }] }),
  }), env, {});
  assert.equal(response.status, 403);
});

test('Workers entry serves assets and applies security headers', async () => {
  const response = await worker.fetch(new Request(base + '/'), env, {});
  assert.equal(response.status, 200);
  assert.match(await response.text(), /GISBot/);
  assert.equal(response.headers.get('x-frame-options'), 'DENY');
  assert.match(response.headers.get('content-security-policy'), /frame-ancestors 'none'/);
});

test('Workers entry reports missing ASSETS rather than fake success', async () => {
  const response = await worker.fetch(new Request(base + '/'), {}, {});
  assert.equal(response.status, 503);
});
