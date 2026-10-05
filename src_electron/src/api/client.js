/**
 * SuperCalcee Resilient HTTP API Client
 * =====================================
 * 
 * Provides robust communication with the local FastAPI backend (Port 8000).
 * Features:
 *  - Configurable timeout handling with AbortController
 *  - Explicit cancellation support for long-running calculations
 *  - Retry policy with exponential backoff for network/transient failures
 *  - Standardized typed error categorization (TIMEOUT, SERVER_UNAVAILABLE, MALFORMED_RESPONSE, etc.)
 *  - Automatic correlation tracking via X-Request-ID
 * 
 * @module api/client
 * @author SuperCalcee Open Source Team
 * @license MIT
 */

/**
 * Resolves the operational backend API base URL based on runtime environment:
 * 1. Saved localStorage setting (`supercalcee_api_url`)
 * 2. Vite environment variable (`VITE_API_BASE_URL`)
 * 3. Browser host IP/domain if accessed remotely (e.g. from mobile on local Wi-Fi)
 * 4. Default fallback: http://127.0.0.1:8000
 * 
 * @returns {string} Fully-qualified backend base URL
 */
export const getEffectiveBaseUrl = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const customUrl = window.localStorage.getItem('supercalcee_api_url');
      if (customUrl && customUrl.trim()) {
        return customUrl.trim().replace(/\/+$/, '');
      }
    } catch {
      // localStorage may be disabled in private/sandboxed contexts
    }
  }

  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const host = window.location.hostname;
    if (host !== 'localhost' && host !== '127.0.0.1' && host !== '') {
      return `${window.location.protocol}//${host}:8000`;
    }
  }

  return 'http://127.0.0.1:8000';
};

export const DEFAULT_BASE_URL = 'http://127.0.0.1:8000';
export const DEFAULT_TIMEOUT_MS = 8000;

/**
 * Standard error codes mapped across the SuperCalcee architecture.
 */
export const ErrorCodes = {
  TIMEOUT: 'TIMEOUT',
  CANCELLED: 'CANCELLED',
  SERVER_UNAVAILABLE: 'SERVER_UNAVAILABLE',
  MALFORMED_RESPONSE: 'MALFORMED_RESPONSE',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DOMAIN_ERROR: 'DOMAIN_ERROR',
  ZERO_DIVISION_ERROR: 'ZERO_DIVISION_ERROR',
  CONVERGENCE_ERROR: 'CONVERGENCE_ERROR',
  CALCULATION_ERROR: 'CALCULATION_ERROR',
  SECURITY_VIOLATION: 'SECURITY_VIOLATION',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};

/**
 * Generates a standard random correlation UUID string.
 * Compatible across browser window.crypto and Node.js environments.
 * 
 * @returns {string} Hexadecimal correlation identifier.
 */
export const generateCorrelationId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, '');
  }
  return 'req_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

/**
 * Pauses execution for a specified duration in milliseconds.
 * 
 * @param {number} ms - Milliseconds to sleep.
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Core ApiClient class for SuperCalcee.
 */
export class ApiClient {
  /**
   * @param {string} [baseUrl] - Base URL for the FastAPI backend.
   * @param {number} [defaultTimeout=DEFAULT_TIMEOUT_MS] - Default request timeout in milliseconds.
   */
  constructor(baseUrl, defaultTimeout = DEFAULT_TIMEOUT_MS) {
    const resolvedUrl = baseUrl || getEffectiveBaseUrl();
    this.baseUrl = resolvedUrl.replace(/\/+$/, '');
    this.defaultTimeout = defaultTimeout;
  }

  /**
   * Retrieves current base URL.
   * @returns {string}
   */
  getBaseUrl() {
    return this.baseUrl;
  }

  /**
   * Updates base URL dynamically and persists to localStorage if in browser.
   * @param {string} newUrl
   */
  setBaseUrl(newUrl) {
    if (newUrl && typeof newUrl === 'string') {
      this.baseUrl = newUrl.trim().replace(/\/+$/, '');
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.setItem('supercalcee_api_url', this.baseUrl);
        } catch {
          // ignore storage error
        }
      }
    }
  }

  /**
   * Constructs a fully-qualified endpoint URL.
   * 
   * @param {string} endpoint - Relative path (e.g. '/cas/simplify' or 'health').
   * @returns {string} Absolute URL.
   */
  buildUrl(endpoint) {
    const cleanPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.baseUrl}${cleanPath}`;
  }

  /**
   * Executes an HTTP request with timeout, cancellation, retries, and structured error formatting.
   * 
   * @param {string} endpoint - Target endpoint path.
   * @param {Object} [options={}] - Request options.
   * @param {'GET'|'POST'|'OPTIONS'} [options.method='GET'] - HTTP method.
   * @param {any} [options.body] - Payload data (object will be JSON stringified).
   * @param {Record<string, string>} [options.headers={}] - Custom HTTP headers.
   * @param {number} [options.timeout] - Milliseconds before request is aborted.
   * @param {AbortSignal} [options.signal] - Optional external AbortSignal for user cancellation.
   * @param {number} [options.retries=0] - Number of retry attempts on network failures.
   * @param {number} [options.backoffMs=200] - Initial exponential backoff delay in ms.
   * @returns {Promise<{ success: boolean, data?: any, error?: { code: string, message: string, details?: any }, status: number, requestId: string }>}
   */
  async request(endpoint, options = {}) {
    const {
      method = 'GET',
      body,
      headers = {},
      timeout = this.defaultTimeout,
      signal: externalSignal,
      retries = 0,
      backoffMs = 200,
    } = options;

    const url = this.buildUrl(endpoint);
    const requestId = headers['X-Request-ID'] || generateCorrelationId();

    const requestHeaders = {
      'Accept': 'application/json',
      'X-Request-ID': requestId,
      ...headers,
    };

    let serializedBody = body;
    if (body !== undefined && typeof body === 'object' && !(body instanceof FormData) && !(body instanceof Blob)) {
      requestHeaders['Content-Type'] = 'application/json';
      serializedBody = JSON.stringify(body);
    }

    let attempt = 0;
    while (attempt <= retries) {
      // Setup AbortController for timeout and external cancellation
      const controller = new AbortController();
      let isTimeout = false;

      // Listen to external cancellation signal if provided
      let cleanupExternalSignal = null;
      if (externalSignal) {
        if (externalSignal.aborted) {
          return {
            success: false,
            error: {
              code: ErrorCodes.CANCELLED,
              message: 'Calculation was cancelled by the user.',
              details: { requestId },
            },
            status: 0,
            requestId,
          };
        }
        const onExternalAbort = () => controller.abort();
        externalSignal.addEventListener('abort', onExternalAbort);
        cleanupExternalSignal = () => externalSignal.removeEventListener('abort', onExternalAbort);
      }

      const timer = setTimeout(() => {
        isTimeout = true;
        controller.abort();
      }, timeout);

      try {
        const response = await fetch(url, {
          method,
          headers: requestHeaders,
          body: serializedBody,
          signal: controller.signal,
        });

        clearTimeout(timer);
        if (cleanupExternalSignal) cleanupExternalSignal();

        const returnedRequestId = response.headers?.get?.('X-Request-ID') || requestId;

        // Parse Response JSON
        let data;
        const text = await response.text();
        try {
          data = text ? JSON.parse(text) : {};
        } catch (_jsonErr) {
          return {
            success: false,
            error: {
              code: ErrorCodes.MALFORMED_RESPONSE,
              message: `Server returned non-JSON response (HTTP ${response.status}).`,
              details: { raw: text.slice(0, 300), requestId: returnedRequestId },
            },
            status: response.status,
            requestId: returnedRequestId,
          };
        }

        if (response.ok) {
          return {
            success: true,
            data: data.result !== undefined ? data.result : data,
            status: response.status,
            requestId: returnedRequestId,
          };
        }

        // Handle HTTP Error status (4xx / 5xx)
        const errorCode = data.error?.code || (response.status === 422 ? ErrorCodes.VALIDATION_ERROR : ErrorCodes.UNKNOWN_ERROR);
        const errorMessage = data.error?.message || data.detail || `Request failed with HTTP ${response.status}`;

        return {
          success: false,
          error: {
            code: errorCode,
            message: errorMessage,
            details: data.error?.details || { status: response.status, requestId: returnedRequestId },
          },
          status: response.status,
          requestId: returnedRequestId,
        };

      } catch (err) {
        clearTimeout(timer);
        if (cleanupExternalSignal) cleanupExternalSignal();

        // Check if aborted due to timeout
        if (isTimeout) {
          return {
            success: false,
            error: {
              code: ErrorCodes.TIMEOUT,
              message: `Request timed out after ${timeout}ms. The computation took too long to complete.`,
              details: { timeout, requestId },
            },
            status: 0,
            requestId,
          };
        }

        // Check if aborted due to external cancellation
        if (externalSignal?.aborted) {
          return {
            success: false,
            error: {
              code: ErrorCodes.CANCELLED,
              message: 'Calculation was cancelled by the user.',
              details: { requestId },
            },
            status: 0,
            requestId,
          };
        }

        // Network connection error / Server unavailable
        const isNetworkError = err.name === 'TypeError' || err.message?.includes('fetch') || err.message?.includes('network');

        if (attempt < retries && isNetworkError) {
          attempt++;
          await sleep(backoffMs * Math.pow(2, attempt - 1));
          continue;
        }

        return {
          success: false,
          error: {
            code: ErrorCodes.SERVER_UNAVAILABLE,
            message: 'Cannot connect to Python Computational Core on port 8000. Service may be starting or offline.',
            details: { originalError: err.message, requestId },
          },
          status: 0,
          requestId,
        };
      }
    }
  }

  /**
   * Helper for GET requests.
   */
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  /**
   * Helper for POST requests.
   */
  async post(endpoint, data, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body: data });
  }
}

// Global default singleton instance
export const apiClient = new ApiClient();
