/**
 * SuperCalcee React Frontend Entrypoint
 * =====================================
 * 
 * Mounts the root React component onto the DOM (`#root`) wrapped in React.StrictMode.
 * 
 * @author SuperCalcee Open Source Team
 * @license MIT
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// Mount React Application to DOM root element
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
