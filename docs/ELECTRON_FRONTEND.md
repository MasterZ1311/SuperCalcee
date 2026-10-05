# SuperCalcee Desktop Frontend (Electron & React)

This directory contains the user interface for SuperCalcee, implemented using React 19, Vite, and Electron.

---

## Directory Architecture

```text
src_electron/
├── main.cjs                # Electron main process entry point & window management
├── package.json            # Node project configuration & build scripts
├── vite.config.js          # Vite build pipeline configuration
├── public/                 # Static public assets (favicons, manifest)
└── src/                    # React frontend source code
    ├── main.jsx            # Application root renderer
    ├── App.jsx             # Main UI layout & active tab state management
    ├── index.css           # Global CSS variables & dark glassmorphism styling
    ├── components/         # Modular UI React components
    │   ├── FormulaCalculator.jsx    # Formula execution panel with variable input fields
    │   ├── FormulaStore.jsx         # Section pack library browser & downloader
    │   ├── CustomFormulaBuilder.jsx # Custom user formula creation suite
    │   ├── ConstantsDropdown.jsx    # Scientific constants search & selector
    │   └── IPhoneKeypad.jsx         # Scientific & domain-specific virtual keypad
    ├── data/               # Static data structures & formula pack registry
    │   ├── constants.js             # Formatted scientific constants list
    │   ├── presetFormulas.js        # Default formula catalogue across domain modes
    │   ├── packRegistry.js          # Downloadable section pack catalogue metadata
    │   └── formula_packs/           # Downloadable JSON section formula packs
    └── utils/              # Client-side execution utilities
        └── mathEngine.js        # Evaluation helper for mathematical expressions
```

---

## Key Features

* **Domain Mode Switcher**: Seamlessly toggle keypads and formula lists across Standard, Scientific, CAS, Physics, Astrophysics, Chemistry, Biology, CS, and Finance modes.
* **Modular Section Formula Store**: Browse, install, and uninstall pre-configured formula section packs across multiple disciplines.
* **Custom Formula Builder**: Create, store, and execute custom formulas with defined input variables and target outputs.
* **Scientific Constants Integration**: Instant lookup and insertion of CODATA physical constants directly into calculations.
* **Responsive Dark Glassmorphism Interface**: Sleek desktop layout engineered for multi-monitor setups and professional workflows.

---

## Development Commands

From the repository root:

```bash
# Launch unified desktop app (Vite + Electron + auto-managed Python backend)
npm start

# Run Vite dev server only
npm run dev

# Run frontend contract test suite
npm run test:frontend

# Package standalone desktop executable
npm run package
```

From the `src_electron` directory:

```bash
# Launch unified desktop app
npm start

# Start Vite development server only
npm run dev

# Start Electron shell connected to Vite
npm run electron:start

# Build production client bundle
npm run build

# Package standalone desktop executable
npm run package

# Run frontend test suite
npm test
```

