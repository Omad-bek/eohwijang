import type { UiLang } from '../types';

export interface Strings {
  appName: string;
  books: string;
  addBook: string;
  stage: (n: number) => string;
  wordCount: (n: number) => string;
  mastered: string;
  masteredOf: (a: number, b: number) => string;
  completed: string;
  notStarted: string;
  study: string;
  start: string;
  replay: string;
  close: string;
  check: string;
  continue: string;
  typeInKorean: string;
  retypeLabel: string;
  retypeHint: string;
  correctAnswer: string;
  example: string;
  showTranslation: string;
  hideTranslation: string;
  dontKnow: string;
  round: (n: number) => string;
  mistakesLeft: (n: number) => string;
  level: (n: 1 | 2 | 3) => string;
  newWords: string;
  memoryLevels: string;
  dueReview: (n: number) => string;
  dueShort: (n: number) => string;
  youTyped: string;
  correct: string;
  requeued: string;
  slot: { cho: string; jung: string; jong: string };
  noBatchim: string;
  missingSyl: string;
  extraSyl: string;
  slotWrong: (slot: string, expected: string, typed: string) => string;
  remaining: (n: number) => string;
  stageDone: string;
  missedWords: string;
  firstTry: (pct: number) => string;
  nextStage: string;
  backToUnits: string;
  wordsRange: (from: number, to: number) => string;
  previewWords: string;
  startQuiz: string;
  resume: string;
  backToLevels: string;
  enterToCheck: string;
  units: string;
  stagesCount: (n: number) => string;
  bookProgress: string;
  quit: string;
  promptLang: string;
  uiLang: string;
  settings: string;
  stageSize: string;
  stageSizeHint: string;
  data: string;
  addWords: string;
  addWordsHint: string;
  targetBook: string;
  newBook: string;
  bookId: string;
  bookIdHint: string;
  paste: string;
  chooseFile: string;
  preview: (n: number, skipped: number) => string;
  importWords: string;
  imported: (n: number) => string;
  backup: string;
  backupHint: string;
  exportBackup: string;
  importBackup: string;
  backupRestored: string;
  invalidFile: string;
  storageFull: string;
  emptyBook: string;
  emptyBookHint: string;
  sampleData: string;
  colKo: string;
  colUz: string;
  colRu: string;
  colEn: string;
  langName: { uz: string; ru: string; en: string };
  all: string;
  notHangul: string;
  deleteBook: string;
  bookExists: string;
  dropHint: string;
  dropActive: string;
  loadedFiles: (names: string) => string;
  /** Short cheers flashed on a right answer; one is picked at random. */
  praise: string[];
  keyboard: string;
  keyboardHint: string;
  openKeyboard: string;
  kbShift: string;
  kbBackspace: string;
  kbSpace: string;
  notQuite: string;
  revealed: string;
  streak: (n: number) => string;
  goalLeft: (n: number) => string;
  goalDone: string;
  dailyGoal: (done: number, goal: number) => string;
  totalXp: string;
  lastWeek: string;
  wordOfDay: string;
  whatMeans: string;
  continueLearning: string;
  yourPath: (book: string) => string;
  wordMastery: string;
  levelUpReady: (n: number) => string;
  levelUpHint: string;
  review: string;
  combo: (n: number) => string;
  inARow: (n: number) => string;
  xpGained: (n: number) => string;
  xpEarned: string;
  bestCombo: string;
  darkMode: string;
  lightMode: string;
  muteSounds: string;
  unmuteSounds: string;
  offline: string;
  cloudSync: string;
  cloudSyncHint: string;
  privacyNote: string;
  connectCloud: string;
  linkDevice: string;
  linkDeviceHint: string;
  syncIdLabel: string;
  syncIdKeep: string;
  link: string;
  copy: string;
  copied: string;
  syncNow: string;
  syncing: string;
  syncedAt: (time: string) => string;
  syncFailed: string;
  syncNotFound: string;
  syncBadCode: string;
  disconnect: string;
  disconnectHint: string;
  eraseCloud: string;
  syncUnavailable: string;
  syncOff: string;
  synced: string;
  syncProblem: string;
  linkReplaces: (code: string) => string;
  disconnectClear: string;
}

const en: Strings = {
  appName: 'Eohwijang',
  books: 'Collections',
  addBook: 'Add new collection',
  stage: (n) => `Stage ${n}`,
  wordCount: (n) => `${n} ${n === 1 ? 'word' : 'words'}`,
  mastered: 'Mastered',
  masteredOf: (a, b) => `${a} of ${b} mastered`,
  completed: 'Complete',
  notStarted: 'Not started',
  study: 'Study list',
  start: 'Start stage',
  replay: 'Practise again',
  close: 'Close',
  check: 'Check',
  continue: 'Continue',
  typeInKorean: 'Type it in Korean',
  retypeLabel: 'Type the correct word',
  retypeHint: 'This word returns in the next round.',
  correctAnswer: 'Correct answer',
  example: 'Example',
  showTranslation: 'Show translation',
  hideTranslation: 'Hide translation',
  dontKnow: "Don't know (Skip)",
  round: (n) => `Round ${n}`,
  mistakesLeft: (n) => `Mistakes: ${n} left`,
  level: (n) => (n === 3 ? 'Lvl 3 MAX' : `Lvl ${n}`),
  newWords: 'New',
  memoryLevels: 'Memory levels',
  dueReview: (n) => `Ready for Level-Up Review (${n} ${n === 1 ? 'word' : 'words'} due)`,
  dueShort: (n) => `${n} due`,
  youTyped: 'You typed',
  correct: 'Correct',
  requeued: 'Back in the queue',
  slot: { cho: 'initial', jung: 'vowel', jong: 'final (받침)' },
  noBatchim: 'none',
  missingSyl: 'missing',
  extraSyl: 'extra',
  slotWrong: (slot, e, t) => `${slot}: ${e} not ${t}`,
  remaining: (n) => `${n} left`,
  stageDone: 'Stage mastered',
  missedWords: 'Missed on the first try',
  firstTry: (p) => `${p}% right on the first try`,
  nextStage: 'Next stage',
  backToUnits: 'Back to units',
  wordsRange: (a, b) => `Words ${a}–${b}`,
  previewWords: 'Preview',
  startQuiz: 'Start quiz',
  resume: 'Resume',
  backToLevels: 'Back to levels',
  enterToCheck: 'to check',
  units: 'Units',
  stagesCount: (n) => `${n} ${n === 1 ? 'stage' : 'stages'}`,
  bookProgress: 'Collection progress',
  quit: 'Leave stage',
  promptLang: 'Prompt',
  uiLang: 'Interface',
  settings: 'Settings',
  stageSize: 'Words per stage',
  stageSizeHint: 'Units are split into stages of this size. Progress is kept per word, so changing it loses nothing.',
  data: 'Words & data',
  addWords: 'Add words',
  addWordsHint: 'One word per line: Korean - Uzbek - Russian - English (dashes or tabs between columns). A line like "1과" or "# Unit 2" starts a new unit. JSON ([{ "unit", "ko", "uz", "ru", "en" }]) also works.',
  targetBook: 'Add to',
  newBook: 'New collection…',
  bookId: 'Collection name',
  bookIdHint: 'e.g. 1B, 2A, Food',
  paste: 'Paste words here',
  chooseFile: 'Open file',
  preview: (n, s) => `${n} words ready${s ? `, ${s} lines skipped` : ''}`,
  importWords: 'Add words',
  imported: (n) => `${n} words added`,
  backup: 'Backup',
  backupHint: 'Without Cloud Sync, progress lives in this browser only. Export a backup file to keep a copy of your own.',
  exportBackup: 'Export backup',
  importBackup: 'Restore backup',
  backupRestored: 'Backup restored',
  invalidFile: 'Could not read that. Check the format and try again.',
  storageFull: 'This browser refused to save. Progress from this session may be lost; export a backup.',
  emptyBook: 'No words in this collection yet',
  emptyBookHint: 'Add words under Words & data.',
  sampleData: 'Sample words only; the full 1A list is not loaded yet.',
  colKo: 'Korean',
  colUz: 'Uzbek',
  colRu: 'Russian',
  colEn: 'English',
  langName: { uz: "O'zbekcha", ru: 'Русский', en: 'English' },
  all: 'All',
  notHangul: 'That is not Hangul. Switch your keyboard to Korean (한국어) and try again.',
  deleteBook: 'Delete collection',
  bookExists: 'A collection with that name already exists; words will be added to it.',
  offline: 'Offline',
  cloudSync: 'Cloud Sync',
  cloudSyncHint: 'Keep memory levels, stage records and your collections in step across your phone, tablet and computer.',
  privacyNote: 'Fully anonymous: no email, password, name or any personal information is ever asked for. Your progress is stored under a random code, and that code is the only key to it.',
  connectCloud: 'Connect Cloud',
  linkDevice: 'Link this device',
  linkDeviceHint: 'Already synced on another device? Enter its Sync ID to pull and merge that progress here.',
  syncIdLabel: 'Your Sync ID',
  syncIdKeep: 'Enter this code on your other devices. Anyone who has it can see and change your progress, so keep it like a key.',
  link: 'Link',
  copy: 'Copy',
  copied: 'Copied',
  syncNow: 'Sync now',
  syncing: 'Syncing…',
  syncedAt: (time) => `Synced at ${time}`,
  syncFailed: 'Could not reach the cloud. Your progress is safe here and will sync when the connection is back.',
  syncNotFound: 'No cloud data uses this Sync ID. Check the code on your other device.',
  syncBadCode: 'A Sync ID has 20 letters and digits, like ABCD-EFGH-JKMN-PQRS-TVWX.',
  disconnect: 'Disconnect this device',
  disconnectHint: 'Disconnecting keeps progress on this device. On a shared device, disconnect and clear it so the next person starts empty. Erasing the cloud copy stops sync on every linked device.',
  eraseCloud: 'Erase cloud copy',
  syncUnavailable: 'Cloud Sync is not set up for this copy of the app.',
  syncOff: 'Sync off',
  synced: 'Synced',
  syncProblem: 'Sync failed',
  linkReplaces: (code) => `This device still holds progress from Sync ID ${code}. Linking a different code replaces it with that code’s progress, so the two never mix.`,
  disconnectClear: 'Disconnect and clear this device',
  dropHint: 'Drop .txt, .tsv or .json files here',
  dropActive: 'Drop to load the words',
  loadedFiles: (names) => `Loaded ${names}`,
  praise: ['정답!', 'Great!', 'Nice!', 'Awesome!', 'Spot on!', '잘했어요!'],
  keyboard: 'Korean keyboard',
  keyboardHint: 'While this is open, your own keyboard types Korean too (2-set layout, letters shown on the keys).',
  openKeyboard: 'Use the onscreen Korean keyboard',
  kbShift: 'Shift (ㅃ ㅉ ㄸ ㄲ ㅆ ㅒ ㅖ)',
  kbBackspace: 'Delete',
  kbSpace: 'Space',
  notQuite: 'Not quite: compare it letter by letter',
  revealed: "Here's the word: type it once to remember it",
  streak: (n) => `${n}-day streak`,
  goalLeft: (n) => `${n} more ${n === 1 ? 'word' : 'words'} today to hit your goal`,
  goalDone: 'Goal done for today. Anything more is a bonus.',
  dailyGoal: (a, b) => `Daily goal: ${a} of ${b} words`,
  totalXp: 'total XP',
  lastWeek: 'Last 7 days',
  wordOfDay: 'Word of the day',
  whatMeans: 'What does it mean?',
  continueLearning: 'Continue learning',
  yourPath: (b) => `Your path through ${b}`,
  wordMastery: 'Word mastery',
  levelUpReady: (n) => `${n} ${n === 1 ? 'word is' : 'words are'} ready to level up`,
  levelUpHint: 'Get them right on the first try and they climb a level.',
  review: 'Review',
  combo: (n) => `Combo ${n}`,
  inARow: (n) => `${n} in a row!`,
  xpGained: (n) => `+${n} XP`,
  xpEarned: 'XP earned',
  bestCombo: 'Best combo',
  darkMode: 'Dark mode',
  lightMode: 'Light mode',
  muteSounds: 'Mute sounds',
  unmuteSounds: 'Turn sounds on',
};

const ru: Strings = {
  appName: 'Эохвиджан',
  books: 'Коллекции',
  addBook: 'Добавить коллекцию',
  stage: (n) => `Этап ${n}`,
  wordCount: (n) => `${n} ${n % 10 === 1 && n % 100 !== 11 ? 'слово' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? 'слова' : 'слов'}`,
  mastered: 'Выучено',
  masteredOf: (a, b) => `${a} из ${b} выучено`,
  completed: 'Пройдено',
  notStarted: 'Не начато',
  study: 'Список слов',
  start: 'Начать этап',
  replay: 'Повторить',
  close: 'Закрыть',
  check: 'Проверить',
  continue: 'Дальше',
  typeInKorean: 'Напишите по-корейски',
  retypeLabel: 'Наберите правильное слово',
  retypeHint: 'Это слово вернётся в следующем раунде.',
  correctAnswer: 'Правильный ответ',
  example: 'Пример',
  showTranslation: 'Показать перевод',
  hideTranslation: 'Скрыть перевод',
  dontKnow: 'Не знаю (Пропустить)',
  round: (n) => `Раунд ${n}`,
  mistakesLeft: (n) => `Ошибки: осталось ${n}`,
  level: (n) => (n === 3 ? 'Ур. 3 MAX' : `Ур. ${n}`),
  newWords: 'Новые',
  memoryLevels: 'Уровни памяти',
  dueReview: (n) => `Готово к повышению уровня (к повторению: ${n})`,
  dueShort: (n) => `${n} к повтору`,
  youTyped: 'Вы написали',
  correct: 'Верно',
  requeued: 'Снова в очереди',
  slot: { cho: 'начальная', jung: 'гласная', jong: 'конечная (받침)' },
  noBatchim: 'нет',
  missingSyl: 'пропущен',
  extraSyl: 'лишний',
  slotWrong: (slot, e, t) => `${slot}: ${e}, а не ${t}`,
  remaining: (n) => `осталось ${n}`,
  stageDone: 'Этап выучен',
  missedWords: 'Ошибки с первой попытки',
  firstTry: (p) => `${p}% с первой попытки`,
  nextStage: 'Следующий этап',
  backToUnits: 'К урокам',
  wordsRange: (a, b) => `Слова ${a}–${b}`,
  previewWords: 'Просмотр',
  startQuiz: 'Начать тест',
  resume: 'Продолжить',
  backToLevels: 'К этапам',
  enterToCheck: 'проверить',
  units: 'Уроки',
  stagesCount: (n) => `${n} ${n % 10 === 1 && n % 100 !== 11 ? 'этап' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? 'этапа' : 'этапов'}`,
  bookProgress: 'Прогресс коллекции',
  quit: 'Выйти из этапа',
  promptLang: 'Подсказка',
  uiLang: 'Интерфейс',
  settings: 'Настройки',
  stageSize: 'Слов в этапе',
  stageSizeHint: 'Уроки делятся на этапы такого размера. Прогресс хранится по словам, поэтому ничего не теряется.',
  data: 'Слова и данные',
  addWords: 'Добавить слова',
  addWordsHint: 'Одно слово на строку: корейский - узбекский - русский - английский (через дефис или табуляцию). Строка вида «1과» или «# Урок 2» начинает новый урок. Подходит и JSON ([{ "unit", "ko", "uz", "ru", "en" }]).',
  targetBook: 'Куда',
  newBook: 'Новая коллекция…',
  bookId: 'Название коллекции',
  bookIdHint: 'например 1B, 2A, Еда',
  paste: 'Вставьте слова сюда',
  chooseFile: 'Открыть файл',
  preview: (n, s) => `Готово слов: ${n}${s ? `, пропущено строк: ${s}` : ''}`,
  importWords: 'Добавить слова',
  imported: (n) => `Добавлено слов: ${n}`,
  backup: 'Резервная копия',
  backupHint: 'Без облачной синхронизации прогресс хранится только в этом браузере. Экспортируйте файл, чтобы сохранить свою копию.',
  exportBackup: 'Экспорт копии',
  importBackup: 'Восстановить',
  backupRestored: 'Копия восстановлена',
  invalidFile: 'Не удалось прочитать. Проверьте формат.',
  storageFull: 'Браузер не сохранил данные. Прогресс может потеряться — сделайте резервную копию.',
  emptyBook: 'В этой коллекции пока нет слов',
  emptyBookHint: 'Добавьте их в разделе «Слова и данные».',
  sampleData: 'Только примеры слов; полный список 1A ещё не загружен.',
  colKo: 'Корейский',
  colUz: 'Узбекский',
  colRu: 'Русский',
  colEn: 'Английский',
  langName: { uz: "O'zbekcha", ru: 'Русский', en: 'English' },
  all: 'Все',
  notHangul: 'Это не хангыль. Переключите клавиатуру на корейский (한국어) и попробуйте снова.',
  deleteBook: 'Удалить коллекцию',
  bookExists: 'Такая коллекция уже есть — слова будут добавлены в неё.',
  offline: 'Офлайн',
  cloudSync: 'Облачная синхронизация',
  cloudSyncHint: 'Уровни памяти, результаты этапов и ваши коллекции совпадают на телефоне, планшете и компьютере.',
  privacyNote: 'Полностью анонимно: мы никогда не спрашиваем email, пароль, имя или другие личные данные. Прогресс хранится под случайным кодом, и только этот код открывает к нему доступ.',
  connectCloud: 'Подключить облако',
  linkDevice: 'Связать это устройство',
  linkDeviceHint: 'Уже синхронизируете на другом устройстве? Введите его Sync ID, чтобы загрузить и объединить прогресс.',
  syncIdLabel: 'Ваш Sync ID',
  syncIdKeep: 'Введите этот код на других устройствах. Любой, у кого он есть, может видеть и менять ваш прогресс, поэтому храните его как ключ.',
  link: 'Связать',
  copy: 'Копировать',
  copied: 'Скопировано',
  syncNow: 'Синхронизировать',
  syncing: 'Синхронизация…',
  syncedAt: (time) => `Синхронизировано в ${time}`,
  syncFailed: 'Не удалось связаться с облаком. Прогресс сохранён здесь и синхронизируется, когда появится связь.',
  syncNotFound: 'С этим Sync ID нет данных в облаке. Проверьте код на другом устройстве.',
  syncBadCode: 'Sync ID состоит из 20 латинских букв и цифр, например ABCD-EFGH-JKMN-PQRS-TVWX.',
  disconnect: 'Отключить это устройство',
  disconnectHint: 'При отключении прогресс остаётся на устройстве. На общем устройстве отключите и очистите его, чтобы следующий человек начал с нуля. Удаление облачной копии остановит синхронизацию на всех связанных устройствах.',
  eraseCloud: 'Удалить облачную копию',
  syncUnavailable: 'Облачная синхронизация не настроена в этой версии приложения.',
  syncOff: 'Синхр. выкл.',
  synced: 'Синхронизировано',
  syncProblem: 'Ошибка синхр.',
  linkReplaces: (code) => `На этом устройстве остался прогресс Sync ID ${code}. При связывании другого кода он будет заменён прогрессом нового кода, и данные не смешаются.`,
  disconnectClear: 'Отключить и очистить устройство',
  dropHint: 'Перетащите сюда файлы .txt, .tsv или .json',
  dropActive: 'Отпустите, чтобы загрузить слова',
  loadedFiles: (names) => `Загружено: ${names}`,
  praise: ['정답!', 'Отлично!', 'Верно!', 'Здорово!', 'Супер!', '잘했어요!'],
  keyboard: 'Корейская клавиатура',
  keyboardHint: 'Пока она открыта, ваша клавиатура тоже печатает по-корейски (раскладка 두벌식, буквы подписаны на клавишах).',
  openKeyboard: 'Открыть экранную корейскую клавиатуру',
  kbShift: 'Shift (ㅃ ㅉ ㄸ ㄲ ㅆ ㅒ ㅖ)',
  kbBackspace: 'Стереть',
  kbSpace: 'Пробел',
  notQuite: 'Не совсем: сравните по буквам',
  revealed: 'Вот это слово: наберите его, чтобы запомнить',
  streak: (n) => `${n} ${n % 10 === 1 && n % 100 !== 11 ? 'день' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? 'дня' : 'дней'} подряд`,
  goalLeft: (n) => `Ещё ${n} до цели на сегодня`,
  goalDone: 'Цель на сегодня выполнена. Дальше — бонус.',
  dailyGoal: (a, b) => `Цель дня: ${a} из ${b} слов`,
  totalXp: 'всего XP',
  lastWeek: 'Последние 7 дней',
  wordOfDay: 'Слово дня',
  whatMeans: 'Что это значит?',
  continueLearning: 'Продолжить',
  yourPath: (b) => `Ваш путь по ${b}`,
  wordMastery: 'Освоение слов',
  levelUpReady: (n) => `Готово к повышению уровня: ${n}`,
  levelUpHint: 'Ответьте верно с первой попытки — и слово поднимется на уровень.',
  review: 'Повторить',
  combo: (n) => `Комбо ${n}`,
  inARow: (n) => `${n} подряд!`,
  xpGained: (n) => `+${n} XP`,
  xpEarned: 'Получено XP',
  bestCombo: 'Лучшее комбо',
  darkMode: 'Тёмная тема',
  lightMode: 'Светлая тема',
  muteSounds: 'Выключить звук',
  unmuteSounds: 'Включить звук',
};

const uz: Strings = {
  appName: 'Eohvijang',
  books: "To'plamlar",
  addBook: "Yangi to'plam qo'shish",
  stage: (n) => `${n}-bosqich`,
  wordCount: (n) => `${n} ta so'z`,
  mastered: "O'zlashtirildi",
  masteredOf: (a, b) => `${b} tadan ${a} tasi o'zlashtirildi`,
  completed: 'Tugallandi',
  notStarted: 'Boshlanmagan',
  study: "So'zlar ro'yxati",
  start: 'Bosqichni boshlash',
  replay: 'Yana mashq qilish',
  close: 'Yopish',
  check: 'Tekshirish',
  continue: 'Davom etish',
  typeInKorean: 'Koreyscha yozing',
  retypeLabel: "To'g'ri so'zni yozing",
  retypeHint: "Bu so'z keyingi raundda yana chiqadi.",
  correctAnswer: "To'g'ri javob",
  example: 'Misol',
  showTranslation: "Tarjimani ko'rsatish",
  hideTranslation: 'Tarjimani yashirish',
  dontKnow: "Bilmayman (O'tkazish)",
  round: (n) => `${n}-raund`,
  mistakesLeft: (n) => `Xatolar: ${n} ta qoldi`,
  level: (n) => (n === 3 ? '3-daraja MAX' : `${n}-daraja`),
  newWords: 'Yangi',
  memoryLevels: 'Xotira darajalari',
  dueReview: (n) => `Darajani oshirish vaqti keldi (${n} ta so'z takrorga tayyor)`,
  dueShort: (n) => `${n} ta takrorga`,
  youTyped: 'Siz yozdingiz',
  correct: "To'g'ri",
  requeued: 'Navbatga qaytdi',
  slot: { cho: "bosh undosh", jung: 'unli', jong: 'oxirgi undosh (받침)' },
  noBatchim: "yo'q",
  missingSyl: 'tushib qolgan',
  extraSyl: 'ortiqcha',
  slotWrong: (slot, e, t) => `${slot}: ${t} emas, ${e}`,
  remaining: (n) => `${n} ta qoldi`,
  stageDone: "Bosqich o'zlashtirildi",
  missedWords: 'Birinchi urinishda xato qilinganlar',
  firstTry: (p) => `${p}% birinchi urinishda to'g'ri`,
  nextStage: 'Keyingi bosqich',
  backToUnits: 'Darslarga qaytish',
  wordsRange: (a, b) => `${a}–${b}-so'zlar`,
  previewWords: "Ko'rish",
  startQuiz: 'Testni boshlash',
  resume: 'Davom etish',
  backToLevels: 'Bosqichlarga qaytish',
  enterToCheck: 'tekshirish',
  units: 'Darslar',
  stagesCount: (n) => `${n} ta bosqich`,
  bookProgress: "To'plam bo'yicha natija",
  quit: 'Bosqichdan chiqish',
  promptLang: 'Savol tili',
  uiLang: 'Interfeys',
  settings: 'Sozlamalar',
  stageSize: "Bosqichdagi so'zlar",
  stageSizeHint: "Darslar shu o'lchamdagi bosqichlarga bo'linadi. Natija har bir so'z bo'yicha saqlanadi, hech narsa yo'qolmaydi.",
  data: "So'zlar va ma'lumotlar",
  addWords: "So'z qo'shish",
  addWordsHint: "Har qatorda bitta so'z: koreyscha - o'zbekcha - ruscha - inglizcha (chiziqcha yoki tab bilan). \"1과\" yoki \"# Dars 2\" kabi qator yangi darsni boshlaydi. JSON ([{ \"unit\", \"ko\", \"uz\", \"ru\", \"en\" }]) ham bo'ladi.",
  targetBook: 'Qayerga',
  newBook: "Yangi to'plam…",
  bookId: "To'plam nomi",
  bookIdHint: 'masalan 1B, 2A, Taomlar',
  paste: "So'zlarni shu yerga qo'ying",
  chooseFile: 'Faylni ochish',
  preview: (n, s) => `${n} ta so'z tayyor${s ? `, ${s} ta qator o'tkazib yuborildi` : ''}`,
  importWords: "So'zlarni qo'shish",
  imported: (n) => `${n} ta so'z qo'shildi`,
  backup: 'Zaxira nusxa',
  backupHint: "Bulutli sinxronlashsiz natijalar faqat shu brauzerda saqlanadi. O'z nusxangizni saqlash uchun zaxira faylni eksport qiling.",
  exportBackup: 'Eksport qilish',
  importBackup: 'Tiklash',
  backupRestored: 'Zaxira nusxa tiklandi',
  invalidFile: "O'qib bo'lmadi. Formatni tekshiring.",
  storageFull: "Brauzer saqlamadi. Natijalar yo'qolishi mumkin — zaxira nusxa oling.",
  emptyBook: "Bu to'plamda hali so'z yo'q",
  emptyBookHint: "So'zlar va ma'lumotlar bo'limida qo'shing.",
  sampleData: "Faqat namuna so'zlar; 1A ning to'liq ro'yxati hali yuklanmagan.",
  colKo: 'Koreyscha',
  colUz: "O'zbekcha",
  colRu: 'Ruscha',
  colEn: 'Inglizcha',
  langName: { uz: "O'zbekcha", ru: 'Русский', en: 'English' },
  all: 'Bari',
  notHangul: "Bu hangul emas. Klaviaturani koreyschaga (한국어) o'tkazing va qayta yozing.",
  deleteBook: "To'plamni o'chirish",
  bookExists: "Bu nomdagi to'plam bor — so'zlar unga qo'shiladi.",
  offline: 'Oflayn',
  cloudSync: 'Bulutli sinxronlash',
  cloudSyncHint: "Xotira darajalari, bosqich natijalari va to'plamlaringiz telefon, planshet va kompyuterda bir xil bo'ladi.",
  privacyNote: "To'liq anonim: email, parol, ism yoki boshqa shaxsiy ma'lumot hech qachon so'ralmaydi. Natijalaringiz tasodifiy kod ostida saqlanadi va faqat shu kod ularga kalit bo'ladi.",
  connectCloud: 'Bulutga ulash',
  linkDevice: 'Bu qurilmani bog‘lash',
  linkDeviceHint: "Boshqa qurilmada sinxronlaganmisiz? Natijalarni bu yerga yuklab birlashtirish uchun o'sha Sync ID ni kiriting.",
  syncIdLabel: 'Sizning Sync ID',
  syncIdKeep: "Bu kodni boshqa qurilmalaringizda kiriting. Kimda shu kod bo'lsa, natijalaringizni ko'ra va o'zgartira oladi — uni kalit kabi saqlang.",
  link: 'Bog‘lash',
  copy: 'Nusxalash',
  copied: 'Nusxalandi',
  syncNow: 'Hozir sinxronlash',
  syncing: 'Sinxronlanmoqda…',
  syncedAt: (time) => `${time} da sinxronlandi`,
  syncFailed: "Bulutga ulanib bo'lmadi. Natijalar shu yerda saqlangan va aloqa tiklanganda sinxronlanadi.",
  syncNotFound: "Bu Sync ID bilan bulutda ma'lumot yo'q. Boshqa qurilmadagi kodni tekshiring.",
  syncBadCode: "Sync ID 20 ta lotin harfi va raqamdan iborat, masalan ABCD-EFGH-JKMN-PQRS-TVWX.",
  disconnect: 'Bu qurilmani uzish',
  disconnectHint: "Uzganda natijalar shu qurilmada qoladi. Umumiy qurilmada uni uzib, tozalang — keyingi odam bo'sh holatdan boshlaydi. Bulutdagi nusxani o'chirsangiz, barcha bog'langan qurilmalarda sinxronlash to'xtaydi.",
  eraseCloud: "Bulutdagi nusxani o'chirish",
  syncUnavailable: "Ilovaning bu nusxasida bulutli sinxronlash sozlanmagan.",
  syncOff: "Sinxron o'chiq",
  synced: 'Sinxronlangan',
  syncProblem: 'Sinxron xatosi',
  linkReplaces: (code) => `Bu qurilmada hali ${code} Sync ID natijalari bor. Boshqa kodni bog‘lasangiz, ular yangi kod natijalari bilan almashtiriladi va aralashmaydi.`,
  disconnectClear: 'Uzish va qurilmani tozalash',
  dropHint: ".txt, .tsv yoki .json fayllarni shu yerga tashlang",
  dropActive: "So'zlarni yuklash uchun qo'yib yuboring",
  loadedFiles: (names) => `Yuklandi: ${names}`,
  praise: ['정답!', 'Zo‘r!', 'Barakalla!', 'Ajoyib!', 'To‘g‘ri!', '잘했어요!'],
  keyboard: 'Koreys klaviaturasi',
  keyboardHint: "Ochiq turganda o'z klaviaturangiz ham koreyscha yozadi (두벌식 tartibi, harflar tugmalarda ko'rsatilgan).",
  openKeyboard: "Ekrandagi koreys klaviaturasidan foydalanish",
  kbShift: 'Shift (ㅃ ㅉ ㄸ ㄲ ㅆ ㅒ ㅖ)',
  kbBackspace: "O'chirish",
  kbSpace: "Bo'sh joy",
  notQuite: "Biroz xato: harfma-harf solishtiring",
  revealed: "Mana bu so'z: eslab qolish uchun bir marta yozing",
  streak: (n) => `${n} kun ketma-ket`,
  goalLeft: (n) => `Bugungi maqsadgacha yana ${n} ta so'z`,
  goalDone: "Bugungi maqsad bajarildi. Bundan keyingisi — bonus.",
  dailyGoal: (a, b) => `Kunlik maqsad: ${b} tadan ${a} ta so'z`,
  totalXp: 'jami XP',
  lastWeek: "So'nggi 7 kun",
  wordOfDay: "Kun so'zi",
  whatMeans: "Ma'nosi nima?",
  continueLearning: "O'qishni davom ettirish",
  yourPath: (b) => `${b} bo'yicha yo'lingiz`,
  wordMastery: "So'zlarni o'zlashtirish",
  levelUpReady: (n) => `${n} ta so'z darajasini oshirishga tayyor`,
  levelUpHint: "Birinchi urinishda to'g'ri yozsangiz, so'z bir daraja ko'tariladi.",
  review: 'Takrorlash',
  combo: (n) => `Kombo ${n}`,
  inARow: (n) => `Ketma-ket ${n} ta!`,
  xpGained: (n) => `+${n} XP`,
  xpEarned: 'Olingan XP',
  bestCombo: 'Eng yaxshi kombo',
  darkMode: 'Tungi rejim',
  lightMode: 'Kunduzgi rejim',
  muteSounds: "Ovozni o'chirish",
  unmuteSounds: 'Ovozni yoqish',
};

const ko: Strings = {
  appName: '어휘장',
  books: '컬렉션',
  addBook: '새 컬렉션 추가',
  stage: (n) => `${n}단계`,
  wordCount: (n) => `${n}개 단어`,
  mastered: '익힘',
  masteredOf: (a, b) => `${b}개 중 ${a}개 익힘`,
  completed: '완료',
  notStarted: '시작 전',
  study: '단어 목록',
  start: '단계 시작',
  replay: '다시 연습',
  close: '닫기',
  check: '확인',
  continue: '계속',
  typeInKorean: '한국어로 쓰세요',
  retypeLabel: '정답을 다시 입력하세요',
  retypeHint: '이 단어는 다음 회차에 다시 나옵니다.',
  correctAnswer: '정답',
  example: '예문',
  showTranslation: '번역 보기',
  hideTranslation: '번역 숨기기',
  dontKnow: '모르겠어요 (건너뛰기)',
  round: (n) => `${n}회차`,
  mistakesLeft: (n) => `틀린 단어 ${n}개 남음`,
  level: (n) => (n === 3 ? '레벨 3 MAX' : `레벨 ${n}`),
  newWords: '새 단어',
  memoryLevels: '기억 레벨',
  dueReview: (n) => `레벨 업 복습 가능 (${n}개 단어)`,
  dueShort: (n) => `복습 ${n}개`,
  youTyped: '입력한 답',
  correct: '정답',
  requeued: '다시 대기열로',
  slot: { cho: '초성', jung: '중성', jong: '종성(받침)' },
  noBatchim: '없음',
  missingSyl: '빠짐',
  extraSyl: '추가됨',
  slotWrong: (slot, e, t) => `${slot}: ${t} → ${e}`,
  remaining: (n) => `${n}개 남음`,
  stageDone: '단계 완료',
  missedWords: '첫 시도에서 틀린 단어',
  firstTry: (p) => `첫 시도 정답률 ${p}%`,
  nextStage: '다음 단계',
  backToUnits: '단원으로',
  wordsRange: (a, b) => `${a}–${b}번 단어`,
  previewWords: '미리 보기',
  startQuiz: '퀴즈 시작',
  resume: '이어 하기',
  backToLevels: '단계 목록으로',
  enterToCheck: '확인',
  units: '단원',
  stagesCount: (n) => `${n}개 단계`,
  bookProgress: '컬렉션 진도',
  quit: '단계 나가기',
  promptLang: '제시어',
  uiLang: '화면 언어',
  settings: '설정',
  stageSize: '단계당 단어 수',
  stageSizeHint: '단원을 이 크기의 단계로 나눕니다. 진도는 단어별로 저장되므로 바꿔도 사라지지 않습니다.',
  data: '단어와 데이터',
  addWords: '단어 추가',
  addWordsHint: '한 줄에 한 단어: 한국어 - 우즈베크어 - 러시아어 - 영어 (하이픈이나 탭으로 구분). "1과"나 "# 2단원" 같은 줄은 새 단원을 시작합니다. JSON([{ "unit", "ko", "uz", "ru", "en" }])도 됩니다.',
  targetBook: '추가할 컬렉션',
  newBook: '새 컬렉션…',
  bookId: '컬렉션 이름',
  bookIdHint: '예: 1B, 2A, 음식',
  paste: '여기에 단어를 붙여 넣으세요',
  chooseFile: '파일 열기',
  preview: (n, s) => `${n}개 단어 준비됨${s ? `, ${s}줄 건너뜀` : ''}`,
  importWords: '단어 추가',
  imported: (n) => `${n}개 단어 추가됨`,
  backup: '백업',
  backupHint: '클라우드 동기화를 쓰지 않으면 진도는 이 브라우저에만 저장됩니다. 백업 파일을 내보내 따로 보관하세요.',
  exportBackup: '백업 내보내기',
  importBackup: '백업 복원',
  backupRestored: '백업을 복원했습니다',
  invalidFile: '읽을 수 없습니다. 형식을 확인하세요.',
  storageFull: '브라우저가 저장하지 못했습니다. 백업을 내보내 두세요.',
  emptyBook: '이 컬렉션에는 아직 단어가 없습니다',
  emptyBookHint: '‘단어와 데이터’에서 추가하세요.',
  sampleData: '예시 단어만 있습니다. 1A 전체 목록은 아직 없습니다.',
  colKo: '한국어',
  colUz: '우즈베크어',
  colRu: '러시아어',
  colEn: '영어',
  langName: { uz: "O'zbekcha", ru: 'Русский', en: 'English' },
  all: '전체',
  notHangul: '한글이 아닙니다. 한국어 자판으로 바꾸고 다시 입력하세요.',
  deleteBook: '컬렉션 삭제',
  bookExists: '같은 이름의 컬렉션이 있어 그 컬렉션에 추가됩니다.',
  offline: '오프라인',
  cloudSync: '클라우드 동기화',
  cloudSyncHint: '기억 단계, 스테이지 기록, 내 단어장을 휴대폰·태블릿·컴퓨터에서 똑같이 유지합니다.',
  privacyNote: '완전히 익명입니다. 이메일, 비밀번호, 이름 등 어떤 개인 정보도 묻지 않습니다. 진도는 무작위 코드로만 저장되며, 그 코드가 유일한 열쇠입니다.',
  connectCloud: '클라우드 연결',
  linkDevice: '이 기기 연결',
  linkDeviceHint: '다른 기기에서 이미 동기화 중인가요? 그 기기의 Sync ID를 입력하면 진도를 가져와 합칩니다.',
  syncIdLabel: '내 Sync ID',
  syncIdKeep: '다른 기기에 이 코드를 입력하세요. 코드를 가진 사람은 누구나 진도를 보고 바꿀 수 있으니 열쇠처럼 보관하세요.',
  link: '연결',
  copy: '복사',
  copied: '복사됨',
  syncNow: '지금 동기화',
  syncing: '동기화 중…',
  syncedAt: (time) => `${time}에 동기화됨`,
  syncFailed: '클라우드에 연결할 수 없습니다. 진도는 이 기기에 안전하게 있으며 연결되면 동기화됩니다.',
  syncNotFound: '이 Sync ID로 저장된 데이터가 없습니다. 다른 기기의 코드를 확인하세요.',
  syncBadCode: 'Sync ID는 ABCD-EFGH-JKMN-PQRS-TVWX처럼 영문자와 숫자 20자입니다.',
  disconnect: '이 기기 연결 해제',
  disconnectHint: '연결을 해제해도 진도는 이 기기에 남습니다. 공용 기기라면 해제와 함께 기기를 비워 다음 사람이 빈 상태로 시작하게 하세요. 클라우드 사본을 지우면 연결된 모든 기기의 동기화가 멈춥니다.',
  eraseCloud: '클라우드 사본 삭제',
  syncUnavailable: '이 앱 사본에는 클라우드 동기화가 설정되어 있지 않습니다.',
  syncOff: '동기화 꺼짐',
  synced: '동기화됨',
  syncProblem: '동기화 실패',
  linkReplaces: (code) => `이 기기에는 아직 Sync ID ${code}의 진도가 남아 있습니다. 다른 코드를 연결하면 그 코드의 진도로 바뀌며, 두 데이터는 섞이지 않습니다.`,
  disconnectClear: '연결 해제 후 기기 비우기',
  dropHint: '.txt, .tsv, .json 파일을 여기에 놓으세요',
  dropActive: '놓으면 단어를 불러옵니다',
  loadedFiles: (names) => `불러옴: ${names}`,
  praise: ['정답!', '잘했어요!', '좋아요!', '완벽해요!', '최고예요!', '맞아요!'],
  keyboard: '한글 자판',
  keyboardHint: '자판이 열려 있으면 실제 키보드로도 두벌식 한글을 입력할 수 있습니다 (키에 영문 자리가 표시됩니다).',
  openKeyboard: '화면 한글 자판 사용하기',
  kbShift: 'Shift (ㅃ ㅉ ㄸ ㄲ ㅆ ㅒ ㅖ)',
  kbBackspace: '지우기',
  kbSpace: '띄어쓰기',
  notQuite: '아쉬워요: 자모를 하나씩 비교해 보세요',
  revealed: '정답이에요: 한 번 따라 써 보세요',
  streak: (n) => `${n}일 연속`,
  goalLeft: (n) => `오늘 목표까지 ${n}개 남았어요`,
  goalDone: '오늘 목표 달성! 이제부터는 보너스예요.',
  dailyGoal: (a, b) => `오늘의 목표: ${b}개 중 ${a}개`,
  totalXp: '총 XP',
  lastWeek: '최근 7일',
  wordOfDay: '오늘의 단어',
  whatMeans: '무슨 뜻일까요?',
  continueLearning: '이어서 공부하기',
  yourPath: (b) => `${b} 학습 경로`,
  wordMastery: '단어 숙달도',
  levelUpReady: (n) => `레벨 업 준비된 단어 ${n}개`,
  levelUpHint: '첫 시도에 맞히면 한 단계 올라가요.',
  review: '복습',
  combo: (n) => `콤보 ${n}`,
  inARow: (n) => `${n}연속 정답!`,
  xpGained: (n) => `+${n} XP`,
  xpEarned: '얻은 XP',
  bestCombo: '최고 콤보',
  darkMode: '다크 모드',
  lightMode: '라이트 모드',
  muteSounds: '소리 끄기',
  unmuteSounds: '소리 켜기',
};

export const STRINGS: Record<UiLang, Strings> = { en, ru, uz, ko };
