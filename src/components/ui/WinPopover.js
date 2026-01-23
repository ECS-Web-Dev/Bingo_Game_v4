"use client";

export default function WinPopover({ open, onClose }) {
  if(!open)
      return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl px-6 py-4 text-center">
        <h2 className="text-2xl font-semibold mb-2">Bingo 🎉</h2>
        <p>
          Proceed to the table outside the entrance to claim your prize!
        </p>

        <button
          className="btn bg-blue-600 text-white"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}