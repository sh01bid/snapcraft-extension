import React from 'react';
import ReactDOM from 'react-dom/client';
import EditorApp from '../../src/components/editor/EditorApp';
import { applyTheme } from '../../src/lib/theme';

applyTheme();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <EditorApp />
  </React.StrictMode>
);
