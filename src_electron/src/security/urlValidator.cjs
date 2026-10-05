/**
 * External URL Validation Utility for Electron Security
 * ======================================================
 * 
 * Strictly validates external URLs before passing them to Electron's `shell.openExternal`.
 * Prevents protocol-hijacking, local file disclosure, XSS, and command injection attacks.
 * 
 * Author: SuperCalcee Core Team
 * License: MIT
 */

// Permitted protocols for external navigation
const ALLOWED_PROTOCOLS = new Set(['https:', 'http:']);

// Explicitly forbidden protocols
const FORBIDDEN_PROTOCOLS = new Set([
  'file:',
  'javascript:',
  'data:',
  'vbscript:',
  'shell:',
  'about:',
  'chrome:',
  'devtools:',
]);

/**
 * Validates whether an external URL is safe to open in the system default browser.
 * 
 * @param {string} rawUrl - Raw URL string to test.
 * @returns {boolean} True if the URL is safe, false otherwise.
 */
function isValidExternalUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return false;
  }

  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed.length > 2048) {
    return false;
  }

  // Reject strings containing dangerous control characters or whitespace
  // eslint-disable-next-line no-control-regex
  if (/[\x00-\x1F\x7F\s]/.test(trimmed)) {
    return false;
  }

  try {
    const parsed = new URL(trimmed);

    // Reject explicitly forbidden protocols
    if (FORBIDDEN_PROTOCOLS.has(parsed.protocol)) {
      return false;
    }

    // Must be an allowed protocol (strictly http or https)
    if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
      return false;
    }

    // Must have a non-empty hostname
    if (!parsed.hostname || parsed.hostname.length < 1) {
      return false;
    }

    // Disallow usernames and passwords in external URLs
    if (parsed.username || parsed.password) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

module.exports = {
  isValidExternalUrl,
  ALLOWED_PROTOCOLS,
  FORBIDDEN_PROTOCOLS,
};
