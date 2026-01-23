"use client";

import { useState } from "react";

export default function ResetCardButton({ onConfirm }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex justify-center my-4">
      <button
        className="btn bg-red-600 text-white"
        onClick={() => setOpen(true)}
      >
        Reset Card
      </button>

      {open && (
        <div className="absolute z-40 mt-2 w-[min(92vw,360px)] rounded border bg-white shadow-lg p-4 text-center">
          <h3 className="font-semibold mb-2 text-red-600">
            Reset your Bingo card?
          </h3>

          <p className="text-sm mb-4">
            This will clear <strong>all checked boxes and names</strong>.
            <br />
            <span className="font-medium">Are you sure you want to proceed?</span>
          </p>

          <div className="flex justify-end gap-2">
            <button
              className="px-3 py-1 rounded border"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>

            <button
              className="px-3 py-1 rounded bg-red-600 text-white"
              onClick={() => {
                onConfirm();
                setOpen(false);
              }}
            >
              Confirm Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
