"use client";
import { useState, useRef } from "react";

export default function ResetButton({
  buttonText = "Reset Game?",
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  return (
    <div ref={wrapRef} className="relative flex justify-center my-4">
      <button
        className="px-4 py-2 rounded bg-emerald-600 text-white shadow"
        onClick={() => setOpen(true)}
      >
        {buttonText}
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-[min(92vw,320px)] rounded border bg-white shadow-lg p-3 text-center">
          <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-3 py-2">
            {proofText}
          </div>

          <div className="mt-3">
            <button
              className="px-3 py-1.5 rounded border"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
