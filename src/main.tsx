import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/nunito/wght.css';
// Hangul fallback for syllables Jua lacks; 92 small range-split files, fetched only when such a syllable appears.
import '@fontsource/nanum-gothic/800.css';
import './fonts.css';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
