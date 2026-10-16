import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/gowun-batang/korean-700.css';
import '@fontsource/gowun-batang/latin-700.css';
import './lab.css';
import { Lab } from './Lab';

createRoot(document.getElementById('lab')!).render(
  <StrictMode>
    <Lab />
  </StrictMode>,
);
