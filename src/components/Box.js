import { useState, useRef } from 'react';
import { Check } from 'lucide-react';

export default function Box({ boxId, text, checked, onToggle }) {
  const [open, setOpen] = useState(false);
  const timer = useRef(null);

  // --- Long press handlers ---
  const start = (e) => {
    e.preventDefault();
    timer.current = setTimeout(() => setOpen(true), 350); // open modal after 350ms
  };

  const end = () => {
    clearTimeout(timer.current);
  };
  // ---------------------------

  return (
    <>
      <div
        role="checkbox"
        aria-checked={checked}
        tabIndex={0}
        onClick={() => onToggle(boxId)}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onToggle(boxId)}
        onPointerDown={start}
        onPointerUp={end}
        onPointerLeave={end}
        onContextMenu={(e) => e.preventDefault()}
        className={`relative w-full h-full flex items-center justify-center text-center
                    p-2 sm:p-3 md:p-4 select-none transition-colors cursor-pointer
                    ${checked ? "bg-amber-200 text-black" : "bg-yellow-50 text-gray-900"}`}
      >
        {checked && <Check className="absolute top-1 right-1 w-4 h-4 sm:w-5 sm:h-5 opacity-90" />}

        <span className="block whitespace-normal break-words leading-snug px-1 text-[clamp(0.8rem,2.6vw,1rem)] line-clamp-3">
          {text}
        </span>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
          <div className="w-full sm:w-auto sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl p-5">
            <div className="text-lg sm:text-xl font-semibold mb-3 text-center">{text}</div>
            <div className="flex justify-center gap-2">
              <button
                type="button"
                className="px-4 py-2 rounded bg-blue-600 text-white"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
