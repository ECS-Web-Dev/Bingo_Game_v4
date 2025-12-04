"use client";

import { useState, useRef } from 'react';
import { Check } from 'lucide-react';

export default function Box({ boxId, text, checked, onToggle }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const timeoutRef = useRef(null);
  
  function handlePressStart(){
    timeoutRef.current = setTimeout(() => setShowTooltip(true), 350);
  }

  function handlePressEnd(){
    clearTimeout(timeoutRef.current);
    setShowTooltip(false);
  }

  return (
    <div className="relative w-full h-full">
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute z-50 px-3 py-2
            bg-black text-white text-sm rounded
            max-w-xs
            left-1/2 -translate-x-1/2
            bottom-full mb-2
            shadow-lg
            break-words"
        >
          {text}
      </div>
      )}

    <button
      onPointerDown={handlePressStart}
      onPointerUp={handlePressEnd}
      onPointerLeave={handlePressEnd}
      onClick={() => onToggle(boxId)}
      className={`relative w-full h-full flex items-center justify-center text-center
                  p-2 sm:p-3 md:p-4 select-none transition-colors
                  ${checked ? "bg-amber-200 text-black" : "bg-yellow-50 text-gray-900"}`}
    >
      {checked && (
        <Check 
          className="absolute top-1 right-1 w-4 h-4 sm:w-5 sm:h-5 opacity-90"
        />
      )}
      <span
        className="
          block
          whitespace-normal break-words
          leading-tight
          px-1
          text-[clamp(0.68rem,2.2vw,1rem)]
        "
      >
        {text}
      </span>
    </button>
    </div>
  );
}
