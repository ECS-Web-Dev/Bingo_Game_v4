"use client";

import { useState, useRef } from 'react';
import { Check } from 'lucide-react';

export default function Box({ 
  box,              // ← whole box object instead of individual fields
  onOpenEditor      // ← replaces onToggle
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const timeoutRef = useRef(null);
  
  function handlePressStart(){
    timeoutRef.current = setTimeout(() => setShowTooltip(true), 350);
  }

  function handlePressEnd(){
    clearTimeout(timeoutRef.current);
    setShowTooltip(false);
  }

  // CSS classes for clamping text inside the box to 5 lines
  const collapsedClampClasses =
    "overflow-hidden [display:-webkit-box] [-webkit-line-clamp:4] [-webkit-box-orient:vertical] [text-overflow:ellipsis]";


  return (
    <div className="relative w-full h-full">
      {/* Tooltip: full text on long press */}
      {showTooltip && (
        <div className="
            absolute z-50 px-3 py-2
            bg-black text-white text-sm rounded
            max-w-xs
            left-1/2 -translate-x-1/2
            bottom-full mb-2
            shadow-lg
            break-words"
        >
          {box.text}
      </div>
      )}

    <button
      onPointerDown={handlePressStart}
      onPointerUp={handlePressEnd}
      onPointerLeave={handlePressEnd}
      onClick={() => onOpenEditor(box.boxId)}
      className={`
        relative w-full h-full 
        p-2 sm:p-3 md:p-4 
        select-none transition-colors
        ${
          box.checked 
            ? "bg-amber-200 text-black" 
            : "bg-yellow-50 text-gray-900"}
      `}
    >
      {box.checked && (
        <Check 
          className="absolute top-1 right-1 w-4 h-4 sm:w-5 sm:h-5 opacity-90"
        />
      )}
      
      {/* Wrapper to anchor text at the TOP, center horizontally */}
      <div className="h-full w-full flex items-start justify-center">
        <span
          className={`
            mt-0.5
            px-0.5
            text-left
            whitespace-normal
            break-normal
            hyphens-auto
            [word-break:normal]
            [overflow-wrap:normal]
            leading-tight
            text-[clamp(0.68rem,2.2vw,0.95rem)]
            ${collapsedClampClasses}
          `}
        >
          {box.text}
        </span>
      </div>
    </button>
    </div>
  );
}
