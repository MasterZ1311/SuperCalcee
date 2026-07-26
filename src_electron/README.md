# SuperCalcee Desktop Application (Frontend Module)

> **Document Type:** Sub-Module Documentation (Frontend Layer)  
> **Unique Purpose:** Specific guide for the Electron desktop wrapper, React 19 UI component structure, glassmorphism design system, Vite 6 build pipeline, and IPC sidecar lifecycle management.  
> **Navigation:** [Root README](file:///e:/Github/GitProjects/SuperCalcee/README.md) | [PRD & Blueprint](file:///e:/Github/GitProjects/SuperCalcee/SUPERCALCEE.md) | [Technical Deep-Dive](file:///e:/Github/GitProjects/SuperCalcee/understanding_supercalcee.md) | [Verification Log](file:///e:/Github/GitProjects/SuperCalcee/walkthrough.md) | [Backend Guide](file:///e:/Github/GitProjects/SuperCalcee/src_python/README.md)

---

## Architecture & Component Layout

The frontend layer is built with Electron and React to deliver a frameless, Apple-inspired dark mode experience.

```
src_electron/
├── main.cjs                 # Electron main process & Python sidecar process manager
├── index.html               # Main HTML entry point
├── package.json             # Electron & React dependencies, build scripts
├── vite.config.js           # Vite development and bundle configuration
└── src/                     # React application source code
    ├── main.jsx             # React DOM root entry
    ├── App.jsx              # Core app container, domain router & state coordinator
    ├── index.css            # Glassmorphism styling, CSS custom properties & animations
    └── components/          # Reusable UI components
        ├── Sidebar.jsx      # Scientific domain navigation sidebar
        ├── Display.jsx      # Expression entry & calculated result screen
        ├── Keypad.jsx       # Dynamic mathematical keyboard layout
        ├── History.jsx      # Calculation history drawer
        └── FormulaModal.jsx # Interactive inverse formula solving modal
```

---

## UI & Design System Specs

* **Theme:** Glassmorphism Dark Mode with blur filters (`backdrop-filter: blur(20px)`).
* **Typography:** Inter / System UI sans-serif stack.
* **Palette:**
  * Background: Semi-transparent charcoal (`rgba(18, 18, 20, 0.75)`)
  * Accents: Electric Indigo (`#6366f1`), Violet (`#8b5cf6`), Emerald (`#10b981`)
  * Text: High-contrast white (`#f8fafc`) and muted slate (`#94a3b8`)
* **Responsive Behavior:** Dynamic flex layout adapting to window resizing.

---

## Python Backend Lifecycle Management

When the main process (`main.cjs`) boots:
1. Spawns `python ../src_python/api.py` or uses the bundled venv python executable (`../venv/Scripts/python.exe`).
2. Polls `http://127.0.0.1:8000/health` with exponential backoff until a `200 OK` status is returned.
3. Displays the main Electron browser window once backend readiness is confirmed.
4. On window close, sends a termination signal to cleanly shut down the child Python process.

---

## Development Scripts

Run these scripts from within the `src_electron` directory:

```bash
# Launch Electron and auto-start Python backend (Dev mode)
npm start

# Run Vite dev server only (Frontend web preview)
npm run dev

# Build production bundle for Electron
npm run build

# Package desktop application into standalone installer/binary
npm run package
```

---

## Frontend Testing & Verification

1. Verify Electron boots without white screen or IPC bridge errors.
2. Confirm Lucide React icons render properly in the domain sidebar.
3. Test key press input and expression dispatching to Python REST API (`http://127.0.0.1:8000/calculate`).
