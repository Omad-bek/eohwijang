import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Settings, Stage, VocabEntry } from './types';
import { STRINGS } from './lib/i18n';
import { allBooks, stagesForUnit, wordId } from './lib/books';
import { useCloudSync, useNow, useOnline, useUserData, useVisualViewportHeight } from './lib/hooks';
import { applyOutcome, type Outcome } from './lib/srs';
import { addActivity } from './lib/activity';
import { useTheme } from './lib/theme';
import { useSound } from './lib/soundEngine';
import { clearSession, loadSession, sessionFor, type SavedSession } from './lib/session';
import { Home } from './components/Home';
import { Manager } from './components/Manager';
import { Navbar } from './components/Navbar';
import { CloudSyncDialog } from './components/CloudSyncDialog';
import { AdminPanel } from './components/AdminPanel';
import { useSharedBooks } from './lib/global';
import { Quiz } from './components/Quiz';
import { StagePreview } from './components/StagePreview';

type View =
  | { kind: 'home' }
  | { kind: 'quiz'; stage: Stage; run: number; resume: SavedSession | null }
  | { kind: 'data'; newBook: boolean };

const BOOK_KEY = 'project-vocab:book';

const isAdminHash = () => window.location.hash === '#admin';

function readBook(): string | null {
  try {
    return localStorage.getItem(BOOK_KEY);
  } catch {
    return null;
  }
}

export default function App() {
  useVisualViewportHeight();
  const { data, update, replace, saveFailed } = useUserData();
  const online = useOnline();
  const sync = useCloudSync(data, update, online);
  const t = STRINGS[data.settings.uiLang];
  const shared = useSharedBooks(online);
  const books = useMemo(() => allBooks(data, shared.books), [data, shared.books]);
  const [admin, setAdmin] = useState(isAdminHash);
  const now = useNow();
  const { theme, toggle: toggleTheme } = useTheme();
  const { on: soundOn, toggle: toggleSound } = useSound();

  const [bookId, setBookId] = useState(() => readBook() ?? '1A');
  const [view, setView] = useState<View>({ kind: 'home' });
  const [preview, setPreview] = useState<Stage | null>(null);
  const [syncOpen, setSyncOpen] = useState(false);
  const closeSync = useCallback(() => setSyncOpen(false), []);

  const activeBook = books.find((b) => b.id === bookId) ?? books[0];

  // Re-read whenever the view changes (a quiz may have just saved) and as the clock moves (it may have expired).
  const saved = useMemo(() => (view.kind === 'quiz' ? null : loadSession(now)), [view, now]);
  const resumable = useCallback((stage: Stage) => sessionFor(saved, stage), [saved]);

  useEffect(() => {
    const onHash = () => setAdmin(isAdminHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const exitAdmin = () => {
    history.replaceState(null, '', window.location.pathname + window.location.search);
    setAdmin(false);
  };

  useEffect(() => {
    document.documentElement.lang = data.settings.uiLang;
    document.title = t.appName === '어휘장' ? '어휘장' : `${t.appName} · 어휘장`;
  }, [data.settings.uiLang, t.appName]);

  const chooseBook = (id: string) => {
    setBookId(id);
    try {
      localStorage.setItem(BOOK_KEY, id);
    } catch {
      /* per-device convenience only */
    }
  };

  const setSettings = useCallback(
    (patch: Partial<Settings>) => update((d) => ({ ...d, settings: { ...d.settings, ...patch } })),
    [update],
  );

  const recordResult = useCallback(
    (stage: Stage, w: VocabEntry, outcome: Outcome) => {
      const id = wordId(stage.bookId, w);
      update((d) => {
        const now = Date.now();
        const next = applyOutcome(d.memory[id], outcome, now);
        const memory = next ? { ...d.memory, [id]: next } : d.memory;
        // A word counts toward today's goal once it is recalled, first try or after a miss.
        const activity = outcome === 'missed' ? d.activity : addActivity(d.activity, now);
        return memory === d.memory && activity === d.activity ? d : { ...d, memory, activity };
      });
    },
    [update],
  );

  const completeStage = useCallback(
    (stage: Stage, share: number) => {
      if (stage.review) return;
      update((d) => {
        const prev = d.stages[stage.key] ?? { completions: 0 };
        return {
          ...d,
          stages: {
            ...d.stages,
            [stage.key]: {
              completions: prev.completions + 1,
              lastCompletedAt: Date.now(),
              bestFirstTry: Math.max(prev.bestFirstTry ?? 0, share),
            },
          },
        };
      });
    },
    [update],
  );

  const nextStageAfter = (stage: Stage): Stage | null => {
    if (stage.review) return null;
    const book = books.find((b) => b.id === stage.bookId);
    if (!book) return null;
    const ordered = book.units.flatMap((u) => stagesForUnit(book, u, data.settings.stageSize));
    const i = ordered.findIndex((s) => s.key === stage.key);
    return i >= 0 && i < ordered.length - 1 ? ordered[i + 1] : null;
  };

  /** Starts the stage afresh, discarding any unfinished run (of this or any other stage). */
  const startStage = (stage: Stage) => {
    clearSession();
    setPreview(null);
    setView({ kind: 'quiz', stage, run: Date.now(), resume: null });
  };

  const resumeStage = (stage: Stage) => {
    const resume = sessionFor(loadSession(), stage);
    if (!resume) return startStage(stage);
    setPreview(null);
    setView({ kind: 'quiz', stage, run: Date.now(), resume });
  };

  return (
    <div className="relative flex h-full flex-col">
      <div className="relative flex min-h-0 flex-1 flex-col pb-[max(8px,env(safe-area-inset-bottom))] pt-[env(safe-area-inset-top)]">
        {saveFailed && (
          <p role="alert" className="shrink-0 rounded-xl bg-danger-wash px-5 py-2 text-[13px] font-semibold text-danger-text">
            {t.storageFull}
          </p>
        )}

        <Navbar
          t={t}
          settings={data.settings}
          online={online}
          onChange={setSettings}
          onHome={() => {
            if (admin) exitAdmin();
            setView({ kind: 'home' });
          }}
          admin={admin}
          onData={() => setView({ kind: 'data', newBook: false })}
          sync={sync}
          onSync={() => setSyncOpen(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
          soundOn={soundOn}
          onToggleSound={toggleSound}
        />

        <div className="mx-auto min-h-0 w-full max-w-7xl flex-1">
          {admin && <AdminPanel shared={shared.books} rows={shared.rows} refresh={shared.refresh} onExit={exitAdmin} />}

          {!admin && view.kind === 'home' && (
            <Home
              t={t}
              books={books}
              data={data}
              memory={data.memory}
              now={now}
              bookId={activeBook.id}
              onBook={chooseBook}
              onPreview={setPreview}
              onStart={startStage}
              resumable={resumable}
              onResume={resumeStage}
              onAddBook={() => setView({ kind: 'data', newBook: true })}
            />
          )}

          {!admin && view.kind === 'quiz' && (
            <Quiz
              key={view.run}
              t={t}
              stage={view.stage}
              settings={data.settings}
              resume={view.resume}
              onResult={(w, outcome) => recordResult(view.stage, w, outcome)}
              onComplete={(share) => completeStage(view.stage, share)}
              onExit={() => setView({ kind: 'home' })}
              nextStage={nextStageAfter(view.stage)}
              onNext={() => {
                const next = nextStageAfter(view.stage);
                if (next) startStage(next);
                else setView({ kind: 'home' });
              }}
            />
          )}

          {!admin && view.kind === 'data' && (
            <Manager
              t={t}
              data={data}
              books={books}
              startWithNewBook={view.newBook}
              update={update}
              replace={replace}
              onBookCreated={chooseBook}
              onBack={() => setView({ kind: 'home' })}
              sync={sync}
            />
          )}
        </div>
      </div>

      {preview && (
        <StagePreview
          t={t}
          stage={preview}
          memory={data.memory}
          now={now}
          resume={resumable(preview)}
          onClose={() => setPreview(null)}
          onStart={() => startStage(preview)}
          onResume={() => resumeStage(preview)}
        />
      )}
      {syncOpen && <CloudSyncDialog t={t} sync={sync} uiLang={data.settings.uiLang} onClose={closeSync} />}
    </div>
  );
}
