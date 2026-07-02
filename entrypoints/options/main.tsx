import React from 'react';
import ReactDOM from 'react-dom/client';
import OptionsApp from '../../src/components/options/OptionsApp';
import { applyTheme } from '../../src/lib/theme';

applyTheme();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <OptionsApp />
  </React.StrictMode>
);
