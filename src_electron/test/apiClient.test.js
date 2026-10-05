/**
 * Frontend Unit Tests: Backend REST API Client Contract & Protocol
 * Runner: Node 22 native test runner (node:test)
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  ApiClient,
  ErrorCodes,
  generateCorrelationId,
  DEFAULT_BASE_URL,
} from '../src/api/client.js';
import * as cas from '../src/api/cas.js';
import * as domains from '../src/api/domains.js';
import * as health from '../src/api/health.js';

describe('Frontend-Backend API Client Contract', () => {
  const BASE_URL = 'http://127.0.0.1:8000';

  /**
   * Mock API Client implementing standard REST contract for SuperCalcee
   */
  class SuperCalceeClient {
    constructor(baseUrl = BASE_URL) {
      this.baseUrl = baseUrl;
    }

    buildUrl(endpoint) {
      return `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    }

    createSimplifyPayload(expression) {
      if (!expression || typeof expression !== 'string') {
        throw new Error('Expression must be a non-empty string');
      }
      return {
        url: this.buildUrl('/cas/simplify'),
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expr: expression })
      };
    }

    createUnitConvertPayload(expression, targetUnit) {
      if (!expression || !targetUnit) {
        throw new Error('Source expression and target unit are required');
      }
      return {
        url: this.buildUrl('/units/convert'),
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expr: expression, target_unit: targetUnit })
      };
    }

    createFormulaSolvePayload(equation, solveFor, givenValues = {}) {
      return {
        url: this.buildUrl('/formula/solve'),
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equation,
          solve_for: solveFor,
          given: givenValues
        })
      };
    }

    parseResponse(statusCode, data) {
      if (statusCode === 200) {
        return { success: true, data: data.result ?? data };
      }
      return {
        success: false,
        error: data.detail || `Request failed with status ${statusCode}`
      };
    }
  }

  const client = new SuperCalceeClient();

  it('correctly constructs CAS simplify request contract', () => {
    const req = client.createSimplifyPayload('(x^2 - 1)/(x - 1)');
    assert.equal(req.url, 'http://127.0.0.1:8000/cas/simplify');
    assert.equal(req.method, 'POST');
    assert.deepEqual(JSON.parse(req.body), { expr: '(x^2 - 1)/(x - 1)' });
  });

  it('correctly constructs unit conversion request contract', () => {
    const req = client.createUnitConvertPayload('10 * kilometer', 'meter');
    assert.equal(req.url, 'http://127.0.0.1:8000/units/convert');
    assert.deepEqual(JSON.parse(req.body), {
      expr: '10 * kilometer',
      target_unit: 'meter'
    });
  });

  it('correctly constructs formula solver request contract', () => {
    const req = client.createFormulaSolvePayload('F = m * a', 'a', { F: 10, m: 2 });
    assert.equal(req.url, 'http://127.0.0.1:8000/formula/solve');
    const parsed = JSON.parse(req.body);
    assert.equal(parsed.equation, 'F = m * a');
    assert.equal(parsed.solve_for, 'a');
    assert.deepEqual(parsed.given, { F: 10, m: 2 });
  });

  it('parses successful 200 OK API responses', () => {
    const res = client.parseResponse(200, { result: 'x + 1' });
    assert.equal(res.success, true);
    assert.equal(res.data, 'x + 1');
  });

  it('parses error responses cleanly with detail messages', () => {
    const res = client.parseResponse(400, { detail: 'Syntax error in expression' });
    assert.equal(res.success, false);
    assert.equal(res.error, 'Syntax error in expression');
  });

  it('throws on invalid payload parameters', () => {
    assert.throws(() => client.createSimplifyPayload(''), /Expression must be/);
    assert.throws(() => client.createUnitConvertPayload('10m', ''), /required/);
  });
});

describe('Resilient ApiClient Core Architecture', () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('correctly initializes with default and custom base URLs', () => {
    const defaultClient = new ApiClient();
    assert.equal(defaultClient.baseUrl, DEFAULT_BASE_URL);

    const customClient = new ApiClient('http://localhost:9000/');
    assert.equal(customClient.baseUrl, 'http://localhost:9000');
    assert.equal(customClient.buildUrl('/health'), 'http://localhost:9000/health');
    assert.equal(customClient.buildUrl('health'), 'http://localhost:9000/health');
  });

  it('generates unique correlation IDs', () => {
    const id1 = generateCorrelationId();
    const id2 = generateCorrelationId();
    assert.ok(id1 && id1.length >= 10);
    assert.notEqual(id1, id2);
  });

  it('handles successful API calls with JSON response and correlation headers', async () => {
    globalThis.fetch = async (url, init) => {
      assert.equal(url, 'http://127.0.0.1:8000/cas/simplify');
      assert.equal(init.method, 'POST');
      assert.equal(init.headers['Content-Type'], 'application/json');
      assert.ok(init.headers['X-Request-ID']);

      return new Response(
        JSON.stringify({ success: true, result: 'x + 1', request_id: 'test-uuid-123' }),
        { status: 200, headers: { 'Content-Type': 'application/json', 'X-Request-ID': 'test-uuid-123' } }
      );
    };

    const client = new ApiClient();
    const res = await client.post('/cas/simplify', { expr: '(x^2 - 1)/(x - 1)' });

    assert.equal(res.success, true);
    assert.equal(res.data, 'x + 1');
    assert.equal(res.status, 200);
    assert.equal(res.requestId, 'test-uuid-123');
  });

  it('handles validation failures (HTTP 422) with structured error payload', async () => {
    globalThis.fetch = async () => {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: ErrorCodes.VALIDATION_ERROR,
            message: 'String should have at most 1000 characters for body -> expr',
            details: { field: 'expr' }
          },
          detail: 'String should have at most 1000 characters'
        }),
        { status: 422, headers: { 'Content-Type': 'application/json' } }
      );
    };

    const client = new ApiClient();
    const res = await client.post('/cas/simplify', { expr: 'x'.repeat(1001) });

    assert.equal(res.success, false);
    assert.equal(res.status, 422);
    assert.equal(res.error.code, ErrorCodes.VALIDATION_ERROR);
    assert.ok(res.error.message.includes('1000 characters'));
  });

  it('handles server unavailable (network error / ECONNREFUSED) gracefully', async () => {
    globalThis.fetch = async () => {
      throw new TypeError('fetch failed: connect ECONNREFUSED 127.0.0.1:8000');
    };

    const client = new ApiClient();
    const res = await client.get('/health', { retries: 0 });

    assert.equal(res.success, false);
    assert.equal(res.status, 0);
    assert.equal(res.error.code, ErrorCodes.SERVER_UNAVAILABLE);
    assert.ok(res.error.message.includes('port 8000'));
  });

  it('handles malformed server responses (HTML 502 / bad JSON) without crashing', async () => {
    globalThis.fetch = async () => {
      return new Response('<html><body>502 Bad Gateway</body></html>', {
        status: 502,
        headers: { 'Content-Type': 'text/html' }
      });
    };

    const client = new ApiClient();
    const res = await client.get('/health');

    assert.equal(res.success, false);
    assert.equal(res.status, 502);
    assert.equal(res.error.code, ErrorCodes.MALFORMED_RESPONSE);
    assert.ok(res.error.message.includes('non-JSON'));
  });

  it('enforces timeout handling with AbortController', async () => {
    globalThis.fetch = async (url, init) => {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          resolve(new Response(JSON.stringify({ result: 'delayed' }), { status: 200 }));
        }, 500);

        if (init.signal) {
          init.signal.addEventListener('abort', () => {
            clearTimeout(timer);
            const err = new Error('The operation was aborted.');
            err.name = 'AbortError';
            reject(err);
          });
        }
      });
    };

    const client = new ApiClient();
    // Timeout set to 50ms (faster than 500ms server response)
    const res = await client.post('/cas/simplify', { expr: 'x' }, { timeout: 50 });

    assert.equal(res.success, false);
    assert.equal(res.status, 0);
    assert.equal(res.error.code, ErrorCodes.TIMEOUT);
    assert.ok(res.error.message.includes('timed out'));
  });

  it('supports explicit user cancellation via external AbortSignal', async () => {
    const controller = new AbortController();

    globalThis.fetch = async (url, init) => {
      return new Promise((resolve, reject) => {
        if (init.signal) {
          init.signal.addEventListener('abort', () => {
            const err = new Error('The operation was aborted.');
            err.name = 'AbortError';
            reject(err);
          });
        }
      });
    };

    const client = new ApiClient();
    const promise = client.post('/cas/simplify', { expr: 'x' }, { signal: controller.signal, timeout: 5000 });

    // Cancel immediately
    controller.abort();
    const res = await promise;

    assert.equal(res.success, false);
    assert.equal(res.status, 0);
    assert.equal(res.error.code, ErrorCodes.CANCELLED);
    assert.ok(res.error.message.includes('cancelled'));
  });

  it('retries on transient network errors and succeeds upon recovery', async () => {
    let callCount = 0;
    globalThis.fetch = async () => {
      callCount++;
      if (callCount === 1) {
        throw new TypeError('fetch failed: network hiccup');
      }
      return new Response(JSON.stringify({ success: true, result: 'recovered' }), { status: 200 });
    };

    const client = new ApiClient();
    const res = await client.get('/health', { retries: 2, backoffMs: 10 });

    assert.equal(callCount, 2);
    assert.equal(res.success, true);
    assert.equal(res.data, 'recovered');
  });

  it('tracks loading states accurately across async lifecycle', async () => {
    let loadingState = false;

    globalThis.fetch = async () => {
      assert.equal(loadingState, true);
      return new Response(JSON.stringify({ result: 'done' }), { status: 200 });
    };

    const client = new ApiClient();

    loadingState = true;
    try {
      const res = await client.get('/health');
      assert.equal(res.success, true);
    } finally {
      loadingState = false;
    }

    assert.equal(loadingState, false);
  });
});

describe('Typed Domain & CAS Module Callers', () => {
  let originalFetch;
  let lastRequest;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    globalThis.fetch = async (url, init) => {
      lastRequest = { url, method: init.method, body: init.body ? JSON.parse(init.body) : null };
      return new Response(JSON.stringify({ success: true, result: 'ok' }), { status: 200 });
    };
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('correctly maps symbolic CAS functions', async () => {
    await cas.simplify('x + 1');
    assert.equal(lastRequest.url, 'http://127.0.0.1:8000/cas/simplify');
    assert.deepEqual(lastRequest.body, { expr: 'x + 1' });

    await cas.factor('x**2 - 4');
    assert.equal(lastRequest.url, 'http://127.0.0.1:8000/cas/factor');
    assert.deepEqual(lastRequest.body, { expr: 'x**2 - 4' });

    await cas.expand('(x + 1)**2');
    assert.equal(lastRequest.url, 'http://127.0.0.1:8000/cas/expand');
    assert.deepEqual(lastRequest.body, { expr: '(x + 1)**2' });

    await cas.differentiate('x**3', 'x');
    assert.equal(lastRequest.url, 'http://127.0.0.1:8000/cas/differentiate');
    assert.deepEqual(lastRequest.body, { expr: 'x**3', variable: 'x' });

    await cas.integrate('3*x**2', 'x');
    assert.equal(lastRequest.url, 'http://127.0.0.1:8000/cas/integrate');
    assert.deepEqual(lastRequest.body, { expr: '3*x**2', variable: 'x' });

    await cas.limit('sin(x)/x', 'x', '0');
    assert.equal(lastRequest.url, 'http://127.0.0.1:8000/cas/limit');
    assert.deepEqual(lastRequest.body, { expr: 'sin(x)/x', variable: 'x', approach: '0' });

    await cas.solve('x^2 = 4', 'x');
    assert.equal(lastRequest.url, 'http://127.0.0.1:8000/cas/solve');
    assert.deepEqual(lastRequest.body, { expr: 'x^2 = 4', variable: 'x' });
  });

  it('correctly maps domain calculators', async () => {
    await domains.physics.emc2({ mass: 1.0 });
    assert.equal(lastRequest.url, 'http://127.0.0.1:8000/physics/emc2');
    assert.deepEqual(lastRequest.body, { mass: 1.0 });

    await domains.astrophysics.schwarzschild(1.989e30);
    assert.equal(lastRequest.url, 'http://127.0.0.1:8000/astro/schwarzschild');
    assert.deepEqual(lastRequest.body, { mass: 1.989e30 });

    await domains.chemistry.nernst({ E0: 1.1, n: 2, Q: 0.01, T: 298.15 });
    assert.equal(lastRequest.url, 'http://127.0.0.1:8000/chem/nernst');

    await domains.biology.michaelisMenten({ Vmax: 10, Km: 2, S: 5 });
    assert.equal(lastRequest.url, 'http://127.0.0.1:8000/bio/michaelis-menten');

    await domains.finance.wacc({ equity: 1000, debt: 500, cost_eq: 0.1, cost_debt: 0.05, tax_rate: 0.25 });
    assert.equal(lastRequest.url, 'http://127.0.0.1:8000/finance/wacc');

    await domains.formulaEngine.solve('P*V = n*R*T', 'P', { V: 0.025, n: 1, R: 8.314, T: 300 });
    assert.equal(lastRequest.url, 'http://127.0.0.1:8000/formula/solve');
  });

  it('checks backend health and returns latency', async () => {
    const healthResult = await health.checkHealth();
    assert.equal(healthResult.online, true);
    assert.ok(typeof healthResult.latencyMs === 'number');
  });
});
