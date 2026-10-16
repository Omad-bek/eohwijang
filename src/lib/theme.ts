import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

/** Per-device choice; without one the app follows the system setting. Read by the inline script in index.html too. */
export const THEME_KEY = 'project-vocab:theme';

/** Browser and status-bar chrome color for each theme (matches --color-ink). */
const CHROME: Record<Theme, string> = { light: '#fff8ee', dark: '#191c23' };

const systemDark = () => typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches;

function savedTheme(): Theme | null {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === 'light' || v === 'dark' ? v : null;
  } catch {
    return null;
  }
}

function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', CHROME[theme]);
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => savedTheme() ?? (systemDark() ? 'dark' : 'light'));

  useEffect(() => apply(theme), [theme]);

  // Until the learner picks one, follow the system as it changes (e.g. automatic dark mode at night).
  useEffect(() => {
    if (typeof matchMedia !== 'function') return;
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (!savedTheme()) setTheme(mq.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const toggle = useCallback(() => {
    setTheme((t) => {
      const next: Theme = t === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        /* the switch still works for this visit */
      }
      return next;
    });
  }, []);

  return { theme, toggle };
}
