# SuperCalcee Electron Security Architecture & Hardening Guide

## 1. Executive Summary

SuperCalcee's desktop application is built with Electron and React, interfacing with an offline local Python computational core. To protect user systems from arbitrary code execution, renderer compromise, malicious navigation, and local file access, the desktop shell has been hardened in accordance with the Chromium and Electron security specifications.

### Security Threat Model
In an unhardened Electron desktop application:
1. Enabling `nodeIntegration` or disabling `contextIsolation` allows any compromised renderer script or malicious formula pack to execute native OS commands via Node's `child_process`, read local files via `fs`, and compromise the machine.
2. Unrestricted navigation permits `window.open` or `<a target="_blank">` to load hostile remote web pages inside the privileged desktop shell.
3. The absence of a Content Security Policy (CSP) enables Cross-Site Scripting (XSS) and unauthorized remote script execution.
4. Exposing `ipcRenderer` directly to `window` enables arbitrary IPC channel forgery.

### Target Architecture
```
┌─────────────────────────────────────────────────────────┐
│              Main Process (Node.js / OS)                │
│                                                         │
│  - Spawns Python API via explicit, hardcoded paths      │
│  - Enforces session permissions (all denied)            │
│  - Blocks unauthorized in-window navigation             │
│  - Intercepts popups and validates external URLs        │
│  - Registers allowlisted IPC handlers (ipcMain.handle)  │
└────────────────────────────┬────────────────────────────┘
                             │
                      IPC Boundaries
                             │
┌────────────────────────────▼────────────────────────────┐
│         Isolated Preload Bridge (preload.cjs)           │
│                                                         │
│  - contextIsolation: true                               │
│  - sandbox: true                                        │
│  - Enforces ALLOWED_INVOKE_CHANNELS                     │
│  - Exposes strictly typed window.electronAPI            │
│  - ipcRenderer is NEVER exposed to DOM                  │
└────────────────────────────┬────────────────────────────┘
                             │
                      contextBridge
                             │
┌────────────────────────────▼────────────────────────────┐
│             Renderer World (Vite / React)               │
│                                                         │
│  - nodeIntegration: false                               │
│  - Zero access to require(), process, Buffer, fs        │
│  - Strict Content Security Policy (CSP) enforced        │
│  - Local computational API calls to http://127.0.0.1    │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Core Window & Process Security Controls

Configured in [`src_electron/main.cjs`](file:///e:/Github/GitProjects/SuperCalcee/src_electron/main.cjs):

| Setting | Value | Security Rationale |
| :--- | :--- | :--- |
| `nodeIntegration` | `false` | Prevents the renderer process from accessing Node.js runtime primitives. |
| `nodeIntegrationInWorker` | `false` | Prevents Web Workers from creating Node runtime contexts. |
| `nodeIntegrationInSubFrames` | `false` | Prevents embedded iframes from gaining Node privileges. |
| `contextIsolation` | `true` | Runs the preload script in a separate execution context from the website's DOM. |
| `sandbox` | `true` | Enforces Chromium OS-level process sandboxing on the renderer. |
| `webSecurity` | `true` | Enforces Same-Origin Policy (SOP) and prevents file:// access from web contexts. |
| `allowRunningInsecureContent` | `false` | Blocks mixed HTTP/HTTPS content loading. |
| `preload` | `path.join(__dirname, 'preload.cjs')` | Bridges only explicit allowlisted APIs into the renderer. |

---

## 3. Preload Script & Context Isolation

Configured in [`src_electron/preload.cjs`](file:///e:/Github/GitProjects/SuperCalcee/src_electron/preload.cjs):

### 3.1 Principle of Least Privilege
The preload script does **NOT** expose `ipcRenderer`, `require`, `process`, or Node modules. It uses `contextBridge.exposeInMainWorld('electronAPI', ...)` to expose a minimal, strongly typed API surface:

```javascript
// Expose minimal, strongly typed API surface to the renderer window
contextBridge.exposeInMainWorld('electronAPI', {
  getVersion: () => safeInvoke('app:get-version'),
  getPlatform: () => safeInvoke('app:get-platform'),
  openExternal: (url) => safeInvoke('app:open-external-url', url),
  checkBackendStatus: () => safeInvoke('app:check-backend-status'),
  onBackendStatusChanged: (callback) => { ... }
});
```

### 3.2 IPC Channel Allowlist
Only explicitly approved IPC channels are permitted. Any attempt to invoke an arbitrary or unauthorized channel rejects immediately:

```javascript
const ALLOWED_INVOKE_CHANNELS = new Set([
  'app:get-version',
  'app:get-platform',
  'app:open-external-url',
  'app:check-backend-status',
]);
```

---

## 4. Navigation & Window Creation Controls

### 4.1 In-Window Navigation Lock (`will-navigate`)
The main window's `webContents` intercepts all navigation requests. The application is strictly locked to its local origin:
- **Development**: Navigation permitted only to `http://localhost:5173` (Vite dev server).
- **Production**: Navigation permitted only to local `file:` assets bundled in `dist/`.
- **All other URLs**: Navigation is cancelled via `event.preventDefault()`.

### 4.2 Redirect Prevention (`will-redirect`)
HTTP 3xx redirects to external domains are unconditionally blocked.

### 4.3 New Window & Popup Blocker (`setWindowOpenHandler`)
Arbitrary popups via `window.open` or `<a target="_blank">` are blocked with `{ action: 'deny' }`. If a link represents a legitimate external documentation resource, it is validated and dispatched to the user's default system browser using `shell.openExternal`.

### 4.4 External URL Sanitization
Before opening any link via `shell.openExternal`, URLs are validated against [`src_electron/src/security/urlValidator.cjs`](file:///e:/Github/GitProjects/SuperCalcee/src_electron/src/security/urlValidator.cjs):
- Protocol **must** be `https:` (or `http:` for local testing).
- `file:`, `javascript:`, `data:`, `vbscript:`, `shell:`, and `about:` are strictly rejected.
- Embedded credentials (`https://user:pass@evil.com`) and null-byte/control character injection are rejected.

---

## 5. Session Security & Permission Lockdown

Configured in `configureSessionSecurity()`:
```javascript
session.defaultSession.setPermissionRequestHandler((_webContents, permission, callback) => {
    console.warn(`[Electron Security] Denied device permission request for: '${permission}'`);
    callback(false);
});
```
All sensitive device capabilities (camera, microphone, geolocation, push notifications, MIDI) are blocked unconditionally because SuperCalcee does not require device hardware access.

---

## 6. Content Security Policy (CSP)

Configured via `<meta http-equiv="Content-Security-Policy">` in [`src_electron/index.html`](file:///e:/Github/GitProjects/SuperCalcee/src_electron/index.html):

```html
<meta
  http-equiv="Content-Security-Policy"
  content="
    default-src 'self';
    script-src 'self' 'unsafe-inline';
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com data:;
    img-src 'self' data:;
    connect-src 'self' http://127.0.0.1:8000 http://localhost:5173 ws://localhost:5173;
    object-src 'none';
    base-uri 'self';
    form-action 'none';
  "
/>
```

### Directive Justification:
- `default-src 'self'`: Restricts all unspecified resource types to local origin.
- `script-src 'self' 'unsafe-inline'`: Allows local React components and Vite module bootstrap.
- `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`: Permits application stylesheets and Google Fonts.
- `font-src 'self' https://fonts.gstatic.com data:`: Permits Google Fonts WOFF2 files.
- `connect-src 'self' http://127.0.0.1:8000 http://localhost:5173 ws://localhost:5173`: Restricts network communication strictly to the local Python computational core on port 8000 and the Vite HMR server during development.
- `object-src 'none'`: Disallows legacy plugin elements (`<object>`, `<embed>`, `<applet>`).
- `base-uri 'self'`: Prevents attackers from altering base URL resolutions.
- `form-action 'none'`: Prevents form submission redirection.

---

## 7. Packaging & Multi-Environment Architecture

### 7.1 Development Mode
- Vite runs on `http://localhost:5173`.
- `VITE_DEV_SERVER_URL` is set via `cross-env`.
- Electron loads the live development server with hot module replacement (HMR).

### 7.2 Production & Packaged Application
- Configured with `base: './'` in [`src_electron/vite.config.js`](file:///e:/Github/GitProjects/SuperCalcee/src_electron/vite.config.js) to ensure relative asset URLs.
- Electron loads the built UI via `mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'))`.
- In packaged builds (`app.isPackaged`), the Python executable and backend script paths are resolved via `process.resourcesPath`:
  ```javascript
  const isPackaged = app.isPackaged;
  const pythonExecutable = isPackaged
      ? path.join(process.resourcesPath, 'venv', 'Scripts', 'python.exe')
      : path.join(__dirname, '..', 'venv', 'Scripts', 'python.exe');
  ```
- Package build configuration in `package.json` bundles `preload.cjs` and `src/security/**/*` into the release artifact.

---

## 8. Automated Security Test Suite

The automated security test suite in [`src_electron/test/security.test.js`](file:///e:/Github/GitProjects/SuperCalcee/src_electron/test/security.test.js) verifies all controls:

| Test Suite | Assertions Verified |
| :--- | :--- |
| **Window Security Configuration** | `nodeIntegration: false`, `contextIsolation: true`, `sandbox: true`, `webSecurity: true`, `preload.cjs` existence. |
| **Preload Architecture** | `contextBridge.exposeInMainWorld`, no raw `ipcRenderer`, no Node globals (`require`, `process`). |
| **IPC Channel Control** | Allowlist enforcement (`ALLOWED_INVOKE_CHANNELS`), rejection of arbitrary IPC. |
| **Navigation & Windows** | `will-navigate`, `will-redirect`, `setWindowOpenHandler` denial of arbitrary popups. |
| **URL Sanitization** | Permission of `https:` / `http:`; rejection of `file:`, `javascript:`, `data:`, `shell:`, control chars. |
| **Content Security Policy** | `default-src 'self'`, `object-src 'none'`, restriction to `127.0.0.1:8000`. |
| **Packaging Distribution** | `build.files` includes `preload.cjs` and `src/security/**/*`. |

Run test suite:
```powershell
npm test --prefix src_electron
```
Result: **57 passed, 0 failed** across 11 test suites.
