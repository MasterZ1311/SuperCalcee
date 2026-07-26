# SuperCalcee Modular Refactor Walkthrough

This document records the system architecture refactoring, component modularization, and documentation overhaul performed on SuperCalcee.

---

## 1. Modular Codebase Restructuring

### Frontend Architecture (`src_electron`)
* **Extracted Core UI Components**: Separated `App.jsx` into specialized subcomponents located in `src_electron/src/components/`:
  * `FormulaCalculator.jsx`: Isolated execution component with dynamic input binding.
  * `FormulaStore.jsx`: Modular UI for browsing, downloading, and uninstalling section formula packs.
  * `CustomFormulaBuilder.jsx`: Suite for defining, testing, and persisting user-defined formulas.
  * `ConstantsDropdown.jsx`: Searchable selector for physical constants.
  * `IPhoneKeypad.jsx`: Specialized virtual keypad supporting scientific and domain modes.
* **Centralized Data & Packs**: Created `src_electron/src/data/` to host constants data (`constants.js`), preset formulas (`presetFormulas.js`), downloadable JSON formula packs (`formula_packs/`), and the registry catalogue (`packRegistry.js`).
* **Extracted Math Utilities**: Created `src_electron/src/utils/mathEngine.js` for expression evaluation logic.

### Backend Architecture (`src_python`)
* **Subpackage Initialization**: Added proper `__init__.py` files across all engine directories (`cas`, `constants`, `domains`, `formula_engine`, `parser`, `units`).
* **Dependency Management**: Standardized root [`requirements.txt`](../requirements.txt) and [`src_python/requirements.txt`](../src_python/requirements.txt).

---

## 2. Documentation Consolidation

* **Centralized `docs/` Directory**: Moved secondary documentation files into the dedicated `docs/` directory to maintain a clean root workspace containing only the primary official [`README.md`](../README.md).
* **Emoji-Free Professional Styling**: Cleaned all documentation markdown files to ensure a clean aesthetic suitable for academic and enterprise open-source distribution.

---

## 3. Verification & Validation

* Verified clean build execution of React 19 + Electron frontend using `npm run dev`.
* Verified Python FastAPI backend endpoints (`/cas/simplify`, `/cas/differentiate`, `/cas/solve`, `/constants`, `/units/convert`) with automated tests.
* Validated zero residual emojis across all source files and markdown documents.
