import { StrictMode, Suspense, lazy, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/nunito/wght.css';
// Hangul fallback for syllables Jua lacks; 92 small range-split files, fetched only when such a syllable appears.
import '@fontsource/nanum-gothic/800.css';
import './fonts.css';
import './index.css';
import App from './App';

// Dev-only design lab (#design-lab/icons, #design-lab/welcome). The DEV constant drops it, and its chunks, from production builds.
const Lab = import.meta.env.DEV ? lazy(() => import('./design-lab/Lab')) : null;
const isLabHash = () => window.location.hash.startsWith('#design-lab');

function Root() {
  const [lab, setLab] = useState(isLabHash);
  useEffect(() => {
    const onHash = () => setLab(isLabHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return Lab && lab ? (
    <Suspense fallback={null}>
      <Lab />
    </Suspense>
  ) : (
    <App />
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
