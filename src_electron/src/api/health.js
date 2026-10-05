/**
 * SuperCalcee Backend Health & System API Module
 * ===============================================
 * 
 * Provides methods for checking backend process readiness, ping latency,
 * and loading fundamental CODATA physical constants.
 * 
 * @module api/health
 * @author SuperCalcee Open Source Team
 * @license MIT
 */

import { apiClient } from './client.js';

/**
 * Checks the operational health and status of the Python backend.
 * 
 * @param {Object} [options={}] - Request options.
 * @param {number} [options.timeout=4000] - Health check timeout in ms.
 * @param {number} [options.retries=1] - Retry attempts on transient blips.
 * @param {import('./client.js').ApiClient} [options.client=apiClient] - API client instance.
 * @returns {Promise<{ online: boolean, version?: string, latencyMs: number, error?: string, requestId?: string }>}
 */
export const checkHealth = async (options = {}) => {
  const { timeout = 4000, retries = 1, client = apiClient } = options;
  const start = performance.now();

  try {
    const res = await client.get('/health', { timeout, retries });
    const latencyMs = Math.round(performance.now() - start);

    if (res.success) {
      return {
        online: true,
        version: res.data?.version || '1.0.0',
        status: res.data?.status || 'Active',
        latencyMs,
        requestId: res.requestId,
      };
    }

    return {
      online: false,
      error: res.error?.message || 'Backend returned non-success status.',
      latencyMs,
      requestId: res.requestId,
    };
  } catch (err) {
    const latencyMs = Math.round(performance.now() - start);
    return {
      online: false,
      error: err.message || 'Connection failed.',
      latencyMs,
    };
  }
};

/**
 * Fetches the complete database of CODATA physical constants.
 * 
 * @param {Object} [options={}] - Request options.
 * @param {import('./client.js').ApiClient} [options.client=apiClient] - API client instance.
 * @returns {Promise<{ success: boolean, data?: Record<string, any>, error?: any }>}
 */
export const getConstants = async (options = {}) => {
  const { client = apiClient, ...rest } = options;
  return client.get('/constants', rest);
};
