/**
 * SuperCalcee Electron Preload Script
 * ===================================
 * 
 * Secure preload bridge exposing allowlisted IPC channels to the renderer process
 * via Electron's contextBridge.
 * 
 * Node integration is disabled and contextIsolation is enabled in main.cjs.
 * 
 * @author SuperCalcee Open Source Team
 * @license MIT
 */

const { contextBridge, ipcRenderer } = require('electron');

/**
 * Strict allowlist of permitted IPC channels for the renderer process.
 */
const ALLOWED_INVOKE_CHANNELS = [
  'app:get-version',
  'app:get-platform',
  'app:open-external-url',
  'app:check-backend-status'
];

/**
 * Validates and executes an IPC invocation through an allowlisted channel.
 * @param {string} channel
 * @param  {...any} args
 * @returns {Promise<any>}
 */
function safeInvoke(channel, ...args) {
  if (!ALLOWED_INVOKE_CHANNELS.includes(channel)) {
    throw new Error(`Unauthorized IPC channel invocation: ${channel}`);
  }
  return ipcRenderer.invoke(channel, ...args);
}

contextBridge.exposeInMainWorld('electronAPI', {
  /**
   * Retrieves application version from main process.
   * @returns {Promise<string>} Application version string.
   */
  getVersion: () => safeInvoke('app:get-version'),

  /**
   * Retrieves OS platform identifier (win32, darwin, linux).
   * @returns {Promise<string>} Platform identifier.
   */
  getPlatform: () => safeInvoke('app:get-platform'),

  /**
   * Safely opens an allowlisted external URL in the user's default browser.
   * @param {string} url - Validated URL string.
   * @returns {Promise<{ success: boolean, error?: string }>} Operation result.
   */
  openExternalUrl: (url) => safeInvoke('app:open-external-url', url),

  /**
   * Checks the readiness status of the backend Python process.
   * @returns {Promise<{ ready: boolean, port: number }>} Backend readiness and port.
   */
  checkBackendStatus: () => safeInvoke('app:check-backend-status')
});
