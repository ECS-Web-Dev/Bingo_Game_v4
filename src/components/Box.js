"use client";

import { Check } from "lucide-react";

export default function Box({ boxId, text, checked, onToggle }) {
  return (
    <button
      onClick={() => onToggle(boxId)}
      className={`relative block w-full h-full
                  p-2 sm:p-3 md:p-4 select-none transition-colors overflow-hidden
                  ${checked ? "bg-green-700 text-white" : "bg-yellow-50 text-gray-900"}`}
    >
      {checked && (
        <Check className="absolute top-1 right-1 w-4 h-4 sm:w-5 sm:h-5 opacity-90" />
      )}

      {/* inner column to create tiny symmetric side margins */}
      <div className="mx-auto max-w-[92%] h-full">
        <span
          className="
            block
            text-center
            whitespace-normal break-normal hyphens-none
            leading-tight
            text-[clamp(0.60rem,2.6vw,0.95rem)]
            
          "
        >
          {text}
        </span>
      </div>
    </button>
  );
}
