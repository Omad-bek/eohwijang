import type { UserData } from '../types';

/** Words to recall each day for the daily goal ring. */
export const DAILY_GOAL = 20;
/** XP for each word recalled; XP is derived from the activity log, so it syncs with it. */
export const XP_PER_WORD = 10;

const pad = (n: number) => String(n).padStart(2, '0');

/** Local calendar day of a timestamp, `YYYY-MM-DD`. */
export function dayKey(t: number): string {
  const d = new Date(t);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** One more word recalled today. */
export function addActivity(activity: UserData['activity'], now: number): UserData['activity'] {
  const k = dayKey(now);
  return { ...activity, [k]: (activity[k] ?? 0) + 1 };
}

export interface DaySummary {
  key: string;
  date: Date;
  count: number;
  today: boolean;
}

export interface ActivitySummary {
  today: number;
  /** Consecutive days with at least one word, counting today once it has one (yesterday's streak still stands until midnight). */
  streak: number;
  /** The longest run of consecutive days ever, for "Streak ended · best: N days". */
  best: number;
  /** The last seven days, oldest first, ending today. */
  week: DaySummary[];
  xp: number;
}

const DAY = 24 * 60 * 60 * 1000;

/** Longest run of consecutive calendar days with at least one word. */
function bestStreak(activity: UserData['activity']): number {
  // Noon of each day, so a daylight-saving change never makes two days look 23 or 25 hours apart.
  const days = Object.keys(activity)
    .filter((k) => activity[k] > 0)
    .map((k) => new Date(`${k}T12:00:00`).getTime())
    .filter(Number.isFinite)
    .sort((a, b) => a - b);
  let best = 0;
  let run = 0;
  for (let i = 0; i < days.length; i++) {
    run = i > 0 && Math.round((days[i] - days[i - 1]) / DAY) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
  }
  return best;
}

export function summarize(activity: UserData['activity'], now: number): ActivitySummary {
  const day = (offset: number) => {
    const d = new Date(now);
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - offset);
    return d;
  };
  const todayKey = dayKey(now);
  let streak = 0;
  for (let offset = activity[todayKey] ? 0 : 1; activity[dayKey(day(offset).getTime())]; offset++) streak++;
  const week = Array.from({ length: 7 }, (_, i) => {
    const date = day(6 - i);
    const key = dayKey(date.getTime());
    return { key, date, count: activity[key] ?? 0, today: key === todayKey };
  });
  const total = Object.values(activity).reduce((n, c) => n + c, 0);
  return { today: activity[todayKey] ?? 0, streak, best: Math.max(streak, bestStreak(activity)), week, xp: total * XP_PER_WORD };
}
