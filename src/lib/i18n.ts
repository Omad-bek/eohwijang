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
  offline: string;
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
  backupHint: 'Progress lives in this browser only. Export a backup to move it to another device or keep it safe.',
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
  dropHint: 'Drop .txt, .tsv or .json files here',
  dropActive: 'Drop to load the words',
  loadedFiles: (names) => `Loaded ${names}`,
  praise: ['정답!', 'Great!', 'Nice!', 'Awesome!', 'Spot on!', '잘했어요!'],
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
  backupHint: 'Прогресс хранится только в этом браузере. Экспортируйте копию, чтобы перенести его на другое устройство.',
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
  dropHint: 'Перетащите сюда файлы .txt, .tsv или .json',
  dropActive: 'Отпустите, чтобы загрузить слова',
  loadedFiles: (names) => `Загружено: ${names}`,
  praise: ['정답!', 'Отлично!', 'Верно!', 'Здорово!', 'Супер!', '잘했어요!'],
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
  backupHint: "Natijalar faqat shu brauzerda saqlanadi. Boshqa qurilmaga o'tkazish uchun zaxira nusxani eksport qiling.",
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
  dropHint: ".txt, .tsv yoki .json fayllarni shu yerga tashlang",
  dropActive: "So'zlarni yuklash uchun qo'yib yuboring",
  loadedFiles: (names) => `Yuklandi: ${names}`,
  praise: ['정답!', 'Zo‘r!', 'Barakalla!', 'Ajoyib!', 'To‘g‘ri!', '잘했어요!'],
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
  backupHint: '진도는 이 브라우저에만 저장됩니다. 다른 기기로 옮기려면 백업을 내보내세요.',
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
  dropHint: '.txt, .tsv, .json 파일을 여기에 놓으세요',
  dropActive: '놓으면 단어를 불러옵니다',
  loadedFiles: (names) => `불러옴: ${names}`,
  praise: ['정답!', '잘했어요!', '좋아요!', '완벽해요!', '최고예요!', '맞아요!'],
};

export const STRINGS: Record<UiLang, Strings> = { en, ru, uz, ko };
