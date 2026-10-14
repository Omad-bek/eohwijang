import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/gowun-batang/korean-700.css';
import '@fontsource/gowun-batang/latin-700.css';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
