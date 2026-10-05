/**
 * Electron Security Architecture & Configuration Tests
 * =====================================================
 * 
 * Verifies that the SuperCalcee desktop application adheres strictly to
 * Electron security hardening best practices:
 *  - nodeIntegration is disabled
 *  - contextIsolation is enabled
 *  - sandbox is enabled
 *  - preload script is configured and does not leak raw Node or IPC objects
 *  - arbitrary navigation is prevented
 *  - external URLs are strictly validated
 *  - unexpected IPC channels are rejected
 *  - Content Security Policy is present and restrictive
 * 
 * Author: SuperCalcee Core Team
 * License: MIT
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Import URL validation utility
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { isValidExternalUrl } = require('../src/security/urlValidator.cjs');

describe('Electron Window & Process Security Configuration', () => {
  const mainCjsPath = path.join(projectRoot, 'main.cjs');
  const mainCjsContent = fs.readFileSync(mainCjsPath, 'utf8');

  test('nodeIntegration is explicitly disabled', () => {
    assert.match(
      mainCjsContent,
      /nodeIntegration:\s*false/,
      'SECURITY DEFECT: nodeIntegration must be strictly false in main.cjs'
    );
    assert.doesNotMatch(
      mainCjsContent,
      /nodeIntegration:\s*true/,
      'SECURITY DEFECT: Found nodeIntegration: true in main.cjs'
    );
  });

  test('contextIsolation is explicitly enabled', () => {
    assert.match(
      mainCjsContent,
      /contextIsolation:\s*true/,
      'SECURITY DEFECT: contextIsolation must be true in main.cjs'
    );
    assert.doesNotMatch(
      mainCjsContent,
      /contextIsolation:\s*false/,
      'SECURITY DEFECT: Found contextIsolation: false in main.cjs'
    );
  });

  test('sandbox is explicitly enabled', () => {
    assert.match(
      mainCjsContent,
      /sandbox:\s*true/,
      'SECURITY DEFECT: Chromium renderer sandbox must be enabled in main.cjs'
    );
  });

  test('webSecurity is explicitly enabled', () => {
    assert.match(
      mainCjsContent,
      /webSecurity:\s*true/,
      'SECURITY DEFECT: webSecurity must be true in main.cjs'
    );
  });

  test('preload script is specified and exists on disk', () => {
    assert.match(
      mainCjsContent,
      /preload:\s*path\.join\(__dirname,\s*['"]preload\.cjs['"]\)/,
      'SECURITY DEFECT: Preload script path must be configured in main.cjs'
    );

    const preloadPath = path.join(projectRoot, 'preload.cjs');
    assert.ok(fs.existsSync(preloadPath), 'Preload script file preload.cjs must exist on disk');
  });

  test('device permission requests are denied by default', () => {
    assert.match(
      mainCjsContent,
      /setPermissionRequestHandler/,
      'SECURITY DEFECT: session.setPermissionRequestHandler must be configured'
    );
    assert.match(
      mainCjsContent,
      /callback\(false\)/,
      'SECURITY DEFECT: Unnecessary device permissions must be denied (callback(false))'
    );
  });

  test('arbitrary window creation is intercepted and denied', () => {
    assert.match(
      mainCjsContent,
      /setWindowOpenHandler/,
      'SECURITY DEFECT: mainWindow.webContents.setWindowOpenHandler must be configured'
    );
    assert.match(
      mainCjsContent,
      /return\s*\{\s*action:\s*['"]deny['"]\s*\}/,
      'SECURITY DEFECT: setWindowOpenHandler must deny arbitrary popups ({ action: "deny" })'
    );
  });

  test('in-window navigation is strictly locked down', () => {
    assert.match(
      mainCjsContent,
      /webContents\.on\(\s*['"]will-navigate['"]/,
      'SECURITY DEFECT: will-navigate event handler must be registered'
    );
    assert.match(
      mainCjsContent,
      /webContents\.on\(\s*['"]will-redirect['"]/,
      'SECURITY DEFECT: will-redirect event handler must be registered'
    );
  });
});

describe('Preload Script Architecture & Context Isolation', () => {
  const preloadPath = path.join(projectRoot, 'preload.cjs');
  const preloadContent = fs.readFileSync(preloadPath, 'utf8');

  test('uses contextBridge to expose isolated APIs', () => {
    assert.match(
      preloadContent,
      /contextBridge\.exposeInMainWorld\(\s*['"]electronAPI['"]/,
      'SECURITY DEFECT: Preload must expose APIs strictly through contextBridge.exposeInMainWorld'
    );
  });

  test('does not expose ipcRenderer or raw event emitters to window', () => {
    assert.doesNotMatch(
      preloadContent,
      /window\.ipcRenderer\s*=/,
      'SECURITY DEFECT: Raw ipcRenderer must NEVER be attached to window'
    );
    assert.doesNotMatch(
      preloadContent,
      /ipcRenderer:\s*ipcRenderer/,
      'SECURITY DEFECT: Raw ipcRenderer must not be exposed via contextBridge'
    );
  });

  test('does not expose Node.js runtime globals', () => {
    assert.doesNotMatch(
      preloadContent,
      /require\(child_process\)/,
      'SECURITY DEFECT: child_process must not be accessed in preload'
    );
    assert.doesNotMatch(
      preloadContent,
      /require\(fs\)/,
      'SECURITY DEFECT: fs module must not be accessed in preload'
    );
    assert.doesNotMatch(
      preloadContent,
      /window\.require\s*=/,
      'SECURITY DEFECT: require must not be attached to window'
    );
    assert.doesNotMatch(
      preloadContent,
      /window\.process\s*=/,
      'SECURITY DEFECT: process must not be attached to window'
    );
  });

  test('enforces IPC channel allowlist', () => {
    assert.match(
      preloadContent,
      /ALLOWED_INVOKE_CHANNELS/,
      'SECURITY DEFECT: Preload must define ALLOWED_INVOKE_CHANNELS'
    );
    assert.match(
      preloadContent,
      /app:get-version/,
      'Allowlisted channel app:get-version expected'
    );
    assert.match(
      preloadContent,
      /app:open-external-url/,
      'Allowlisted channel app:open-external-url expected'
    );
  });
});

describe('External URL Sanitization & Protocol Validation', () => {
  test('permits valid HTTPS URLs', () => {
    assert.equal(isValidExternalUrl('https://geeksforgeeks.org'), true);
    assert.equal(isValidExternalUrl('https://financeformulas.net/WACC.html'), true);
    assert.equal(isValidExternalUrl('https://github.com/MasterZ1311/SuperCalcee'), true);
  });

  test('permits standard HTTP URLs for local development', () => {
    assert.equal(isValidExternalUrl('http://localhost:5173'), true);
    assert.equal(isValidExternalUrl('http://127.0.0.1:8000/'), true);
  });

  test('rejects local file protocol (file://)', () => {
    assert.equal(isValidExternalUrl('file:///C:/Windows/System32/cmd.exe'), false);
    assert.equal(isValidExternalUrl('file:///etc/passwd'), false);
    assert.equal(isValidExternalUrl('file://localhost/test'), false);
  });

  test('rejects JavaScript pseudo-protocol (javascript:)', () => {
    assert.equal(isValidExternalUrl('javascript:alert(1)'), false);
    assert.equal(isValidExternalUrl('javascript:eval("malicious")'), false);
  });

  test('rejects data and vbscript schemes', () => {
    assert.equal(isValidExternalUrl('data:text/html,<script>alert(1)</script>'), false);
    assert.equal(isValidExternalUrl('vbscript:msgbox("hello")'), false);
  });

  test('rejects custom shell or system protocols', () => {
    assert.equal(isValidExternalUrl('shell:cmd.exe'), false);
    assert.equal(isValidExternalUrl('about:blank'), false);
    assert.equal(isValidExternalUrl('chrome://gpu'), false);
    assert.equal(isValidExternalUrl('devtools://devtools'), false);
  });

  test('rejects empty, non-string, or malformed inputs', () => {
    assert.equal(isValidExternalUrl(''), false);
    assert.equal(isValidExternalUrl('   '), false);
    assert.equal(isValidExternalUrl(null), false);
    assert.equal(isValidExternalUrl(undefined), false);
    assert.equal(isValidExternalUrl(12345), false);
    assert.equal(isValidExternalUrl('not-a-valid-url'), false);
    assert.equal(isValidExternalUrl('https://'), false);
  });

  test('rejects URLs with embedded credentials or control characters', () => {
    assert.equal(isValidExternalUrl('https://user:password@evil.com'), false);
    assert.equal(isValidExternalUrl('https://evil.com\x00malicious'), false);
  });
});

describe('Content Security Policy (CSP) Configuration', () => {
  const indexPath = path.join(projectRoot, 'index.html');
  const indexContent = fs.readFileSync(indexPath, 'utf8');

  test('index.html contains a Content-Security-Policy meta tag', () => {
    assert.match(
      indexContent,
      /<meta\s+http-equiv=["']Content-Security-Policy["']/i,
      'SECURITY DEFECT: index.html must include a Content-Security-Policy meta tag'
    );
  });

  test('CSP defines restrictive default-src directive', () => {
    assert.match(
      indexContent,
      /default-src\s+['"]self['"]/i,
      'SECURITY DEFECT: CSP must restrict default-src to self'
    );
  });

  test('CSP blocks dangerous object/plugin execution', () => {
    assert.match(
      indexContent,
      /object-src\s+['"]none['"]/i,
      'SECURITY DEFECT: CSP must set object-src to none'
    );
  });

  test('CSP permits connection strictly to local computational backend', () => {
    assert.match(
      indexContent,
      /connect-src\s+[^;]*http:\/\/127\.0\.0\.1:8000/i,
      'CSP must permit connections to computational backend on 127.0.0.1:8000'
    );
  });
});

describe('Electron Builder Packaging Configuration', () => {
  const pkgPath = path.join(projectRoot, 'package.json');
  const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

  test('includes preload.cjs and security utilities in distribution package', () => {
    const files = pkgJson.build?.files || [];
    assert.ok(
      files.includes('preload.cjs'),
      'SECURITY DEFECT: preload.cjs must be listed in package.json build.files'
    );
    assert.ok(
      files.includes('src/security/**/*') || files.includes('src/**/*'),
      'SECURITY DEFECT: security utilities must be packaged in build.files'
    );
  });

  test('defines valid appId, productName, and main entry point', () => {
    assert.equal(pkgJson.main, 'main.cjs', 'Main entry point must be main.cjs');
    assert.equal(pkgJson.build?.appId, 'com.supercalcee.app', 'appId must match com.supercalcee.app');
    assert.equal(pkgJson.build?.productName, 'SuperCalcee', 'productName must be SuperCalcee');
    assert.ok(pkgJson.build?.directories?.output, 'Output directory must be configured');
  });

  test('configures extraResources for bundled Python environment and backend scripts', () => {
    const extraResources = pkgJson.build?.extraResources || [];
    assert.ok(Array.isArray(extraResources) && extraResources.length >= 2, 'extraResources must include venv and src_python');
    
    const venvResource = extraResources.find(r => r.to === 'venv');
    assert.ok(venvResource, 'extraResources must define destination venv');
    assert.equal(venvResource.from, '../venv', 'venv source must map to ../venv');

    const pythonResource = extraResources.find(r => r.to === 'src_python');
    assert.ok(pythonResource, 'extraResources must define destination src_python');
    assert.equal(pythonResource.from, '../src_python', 'src_python source must map to ../src_python');
  });
});

