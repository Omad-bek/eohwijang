/**
 * The privacy page's words, shared by its design variants (A, B) so they differ only in layout.
 * Every statement here must stay true to the code: storage keys in src/lib/*.ts, the vault
 * columns in supabase/schema.sql, the analytics setup in src/lib/analytics.ts, and the feedback
 * form (src/lib/feedback.ts, supabase/feedback.sql, supabase/functions/send-feedback).
 */
import { CloudUpload, Eraser, HardDrive, LibraryBig, MessageCircle, MessageSquareText, Server, ChartNoAxesColumn, type LucideIcon } from 'lucide-react';
import { ANALYTICS_CONFIGURED } from '../../lib/analytics';
import { FEEDBACK_AVAILABLE } from '../../lib/feedback';

export const UPDATED = '27 October 2026';

export const INTRO = {
  title: 'Privacy',
  lead: '어휘장 has no accounts. It never needs your name, email or password, shows no ads, and sets no cookies.',
};

/** The short version, as four facts. */
export const GLANCE = ['No account, no email', 'Progress stays on your device', 'Cloud Sync is optional and anonymous', 'No ads, no cookies'];

export interface Section {
  id: string;
  icon: LucideIcon;
  title: string;
  body: string[];
  list?: string[];
}

export const SECTIONS: Section[] = [
  {
    id: 'device',
    icon: HardDrive,
    title: 'On your device',
    body: ['Everything you do is saved in your browser’s local storage on this device, and nowhere else unless you turn on Cloud Sync:'],
    list: [
      'memory levels for the words you’ve answered, stage results and your daily activity (for the streak and XP)',
      'collections and words you added yourself',
      'settings: interface and prompt language, stage size, theme and sound',
      'an unfinished round, so you can resume it',
      'a copy of the shared word lists, so the app works offline',
    ],
  },
  {
    id: 'sync',
    icon: CloudUpload,
    title: 'If you turn on Cloud Sync',
    body: [
      'Cloud Sync is off until you switch it on in Words & data. Then the app creates a random 20-character Sync ID on your device, and stores one record under it in our Supabase database:',
      'Settings stay on each device and are never uploaded. The Sync ID is not tied to you in any way: it isn’t derived from your device, and we keep no list linking IDs to people. Whoever has the ID can read and change that record, so keep it like a key. Without the ID, nobody, including us through the app, can look a record up.',
    ],
    list: [
      'the Sync ID itself',
      'memory levels, stage results and daily activity counts',
      'your own collections and added words, and which collections you deleted',
      'a revision number and the time of the last change',
    ],
  },
  {
    id: 'words',
    icon: LibraryBig,
    title: 'Shared word lists',
    body: ['The textbook word lists are downloaded from the same database. That is a read-only request: nothing about you is sent with it.'],
  },
  {
    id: 'analytics',
    icon: ChartNoAxesColumn,
    title: 'Usage counts',
    body: ANALYTICS_CONFIGURED
      ? [
          'We count visits and a few actions with Umami, a privacy-friendly analytics service: pages viewed, a practice round started or finished, a collection created, Cloud Sync turned on. It uses no cookies, stores no IP addresses or personal data, and respects your browser’s Do Not Track setting. The counts never include your words, answers or Sync ID.',
        ]
      : ['This copy of the app counts nothing: no analytics script is loaded.'],
  },
  ...(FEEDBACK_AVAILABLE
    ? [
        {
          id: 'feedback',
          icon: MessageSquareText,
          title: 'If you send feedback',
          body: [
            'The feedback form sends only what you write and a little context, and only when you press Send:',
            'It never includes your Sync ID, your words or your progress. The message is saved in our Supabase database and forwarded to the developer as a private Telegram message, so Telegram handles it too, under its own privacy policy. To tell people from spam bots, the form runs a Cloudflare Turnstile check while it is open; Cloudflare processes that check under its own privacy policy.',
            'To limit spam, we keep a salted one-way hash of your IP address and the time you sent, never the address itself. These records are not attached to your message and are deleted automatically after two days. Want a message deleted? Send another one asking for it.',
          ],
          list: [
            'the topic you picked and your message',
            'a contact, only if you type one in (a Telegram username or email, so we can reply)',
            'the collection and unit you were on, the interface language, the app version, and a short browser and system name such as “Chrome 130 · Android”',
          ],
        } satisfies Section,
      ]
    : []),
  {
    id: 'hosting',
    icon: Server,
    title: 'Hosting',
    body: [
      'The site is served by GitHub Pages and the database runs on Supabase. Like any web server, they see your IP address when your browser connects, and may keep it in short-lived technical logs under their own privacy policies. We don’t store it in the app’s database; the feedback form keeps only the temporary hash described above.',
    ],
  },
  {
    id: 'erase',
    icon: Eraser,
    title: 'Erasing your data',
    body: ['You are in control of both copies:'],
    list: [
      'Cloud copy: Words & data → Cloud Sync → “Erase cloud copy”. The record is deleted from the database at once and sync stops on every linked device.',
      'This device: Words & data → Cloud Sync → “Disconnect and clear this device”, or clear this site’s data in your browser settings.',
      'Lost your Sync ID? Then nobody can find the record, us included, because it isn’t linked to you. If you still have the ID but no device, contact us with it and we’ll delete the record.',
    ],
  },
  {
    id: 'contact',
    icon: MessageCircle,
    title: 'Questions',
    body: ['Questions about privacy, or a deletion request? Get in touch through the feedback form below.'],
  },
];
