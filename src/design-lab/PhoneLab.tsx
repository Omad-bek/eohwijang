/**
 * The real app in a phone-sized frame that acts as a touch-only device (`?touch`), so phone-only
 * behaviour, like the onscreen keyboard being the default, can be tried on a desktop browser.
 * It runs on this dev server's own data, never the live site's.
 */
export default function PhoneLab() {
  return (
    <div className="flex h-full flex-col items-center gap-3 overflow-auto p-4 md:p-6">
      <p className="max-w-[390px] text-[13px] font-semibold leading-relaxed text-hanji-2">
        <span className="text-hanji">The app as a 390 × 780 touch phone.</span> Start any stage. On phones the quiz opens with the built-in Korean keyboard. Tap the{' '}
        <span className="font-extrabold text-hanji">⌨ 한글</span> button above the answer field to switch to the phone&apos;s own keyboard (here, your physical
        keyboard), and tap it again to switch back. The choice is remembered.
      </p>
      <iframe title="App on a phone" src="/?touch" className="box-content block h-[780px] w-[390px] max-w-none shrink-0 rounded-[28px] border-2 border-rule bg-ink" />
    </div>
  );
}
