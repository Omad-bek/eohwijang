import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/nunito/wght.css';
import '@fontsource/jua/korean-400.css';
import '@fontsource/jua/latin-400.css';
import '@fontsource/black-han-sans/korean-400.css';
import '@fontsource/black-han-sans/latin-400.css';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
