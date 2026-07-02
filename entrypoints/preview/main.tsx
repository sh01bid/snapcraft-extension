import React from 'react';
import ReactDOM from 'react-dom/client';
import PreviewApp from '../../src/components/preview/PreviewApp';
import { applyTheme } from '../../src/lib/theme';

applyTheme();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PreviewApp />
  </React.StrictMode>
);
