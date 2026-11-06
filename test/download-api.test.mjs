import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { onRequestGet, onRequestPost } from '../functions/api/downloads.js';
import { isSameOriginWrite } from '../server/http.js';

const SITE = 'https://dawnly.example';
const ENDPOINT = `${SITE}/api/downloads`;

// Minimal stand-in for a D1 binding that supports the two queries in server/download-stats.js.
function fakeDb({ count = 0, throws = false } = {}) {
  let current = count;
  return {
    get value() {
      return current;
    },
    prepare(sql) {
      return {
        first: async () => {
          if (throws) throw new Error('db down');
          if (/^\s*SELECT/i.test(sql)) return current === null ? null : { count: current };
          if (/INSERT/i.test(sql)) {
            current += 1;
            return { count: current };
          }
          throw new Error(`unexpected SQL: ${sql}`);
        }
      };
    }
  };
}

function postRequest(origin) {
  const headers = origin === undefined ? {} : { Origin: origin };
  return new Request(ENDPOINT, { method: 'POST', headers });
}

test('isSameOriginWrite accepts only the site\'s own origin', () => {
  assert.equal(isSameOriginWrite(postRequest(SITE)), true);
  assert.equal(isSameOriginWrite(postRequest('https://evil.example')), false);
  assert.equal(isSameOriginWrite(postRequest('not a url')), false);
  assert.equal(isSameOriginWrite(postRequest(undefined)), false);
});

test('GET returns the current count as JSON with no-store caching', async () => {
  const response = await onRequestGet({ env: { DB: fakeDb({ count: 42 }) } });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.deepEqual(await response.json(), { count: 42 });
});

test('GET returns 0 when the counter row does not exist yet', async () => {
  const response = await onRequestGet({ env: { DB: fakeDb({ count: null }) } });
  assert.deepEqual(await response.json(), { count: 0 });
});

test('GET returns 503 when the DB binding is missing', async () => {
  const response = await onRequestGet({ env: {} });
  assert.equal(response.status, 503);
});

test('GET returns 500 when the database query fails', async () => {
  mock.method(console, 'error', () => {});
  const response = await onRequestGet({ env: { DB: fakeDb({ throws: true }) } });
  assert.equal(response.status, 500);
  assert.deepEqual(await response.json(), { error: 'Could not read download count' });
});

test('POST increments the count for a same-origin request', async () => {
  const db = fakeDb({ count: 7 });
  const response = await onRequestPost({ request: postRequest(SITE), env: { DB: db } });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { count: 8 });
  assert.equal(db.value, 8);
});

test('POST without an Origin header is rejected and the count is not changed', async () => {
  const db = fakeDb({ count: 7 });
  const response = await onRequestPost({ request: postRequest(undefined), env: { DB: db } });
  assert.equal(response.status, 403);
  assert.equal(db.value, 7);
});

test('POST from another origin is rejected and the count is not changed', async () => {
  const db = fakeDb({ count: 7 });
  const response = await onRequestPost({ request: postRequest('https://evil.example'), env: { DB: db } });
  assert.equal(response.status, 403);
  assert.equal(db.value, 7);
});

test('POST returns 503 when the DB binding is missing, even for same-origin requests', async () => {
  const response = await onRequestPost({ request: postRequest(SITE), env: {} });
  assert.equal(response.status, 503);
});

test('POST returns 500 when the database update fails', async () => {
  mock.method(console, 'error', () => {});
  const response = await onRequestPost({ request: postRequest(SITE), env: { DB: fakeDb({ throws: true }) } });
  assert.equal(response.status, 500);
  assert.deepEqual(await response.json(), { error: 'Could not update download count' });
});
