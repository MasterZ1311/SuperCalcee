/**
 * SuperCalcee API Client Module Entrypoint
 * ========================================
 * 
 * Re-exports the resilient HTTP client, CAS engine caller, domain calculators,
 * and backend health checker for convenient frontend consumption.
 * 
 * @module api
 * @author SuperCalcee Open Source Team
 * @license MIT
 */

export { ApiClient, apiClient, ErrorCodes, DEFAULT_BASE_URL, DEFAULT_TIMEOUT_MS } from './client.js';
export * as cas from './cas.js';
export * as domains from './domains.js';
export * as health from './health.js';

export * as casApi from './cas.js';
export * as domainsApi from './domains.js';
export * as healthApi from './health.js';

