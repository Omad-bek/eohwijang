import { useState } from 'react';

/** A destructive button that asks for a second tap instead of a browser dialog. */
export function ConfirmButton({ label, confirmLabel, onConfirm, icon }: { label: string; confirmLabel: string; onConfirm: () => void; icon: React.ReactNode }) {
  const [armed, setArmed] = useState(false);
  return (
    <button
      type="button"
      onClick={() => (armed ? (setArmed(false), onConfirm()) : setArmed(true))}
      onBlur={() => setArmed(false)}
      className={`flex h-11 items-center gap-2 border px-4 text-[14px] font-semibold transition-colors ${
        armed ? 'border-danger bg-danger text-ink' : 'border-rule text-hanji hover:border-hanji-2'
      }`}
    >
      {icon}
      {armed ? confirmLabel : label}
    </button>
  );
}
