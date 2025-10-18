'use client';
import { useState, useMemo, useEffect } from 'react';
import Box from '@/components/Box';
import { checkWin } from '@/utils/checkWin';

// Sample texts you’ll later fetch from the DB
const SAMPLE_TEXTS = [
  "Read a poem","Finish a chapter","Take notes","Summarize a scene","Define 3 words",
  "Explain a theme","Spot symbolism","Quote a line","Character sketch","Map a timeline",
  "Predict ending","Identify genre","Do a dance","Paraphrase paragraph","Find conflict",
  "List motifs","New author","Discuss setting","Write question","Compare characters",
  "Find foreshadow","Outline plot","Favorite passage","Hardest part","Teach a friend"
];

function makeBoxes(size = 5, texts = SAMPLE_TEXTS) {
  const boxes = [];
  let n = 1;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const i = r * size + c;
      const text = texts[i] ?? `Prompt ${i + 1}`;
      boxes.push({
        n, //1..25 position used by checkWin
        boxId: `r${r + 1}c${c + 1}`,  // stable ID → great DB key later
        text,                          // the prompt text
        checked: false, // always start unchecked
        row: r + 1,                    // optional: explicit position
        col: c + 1,
      });
      n++;
    }
  }
  return boxes;
}

export default function Card() {
  const size = 5;
  // Generate once per mount so we’re not rebuilding on every re-render
  const [boxes, setBoxes] = useState(() => makeBoxes(size));
  const [winner, setWinner] = useState(false);
  const [showPopover, setShowPopover] = useState(false);

  // NEW: persists for the session even if card is reset
  const [hasEverWon, setHasEverWon] = useState(false);
  const [showWinProof, setShowWinProof] = useState(false);

  function onToggle(boxId) {
    setBoxes(prev =>
      prev.map(b => (b.boxId === boxId ? { ...b, checked: !b.checked } : b))
    );
  }

  // Recalculate win state on any change
  useEffect(() => {
    const doneArr = boxes.filter(b => b.checked).map(b => b.n);
    const won = checkWin(doneArr);
    setWinner(won);
    setShowPopover(won); // show popover when a win happens

    if (won) setHasEverWon(true);  // <-- flip once; do NOT clear on reset
  }, [boxes]);

  return (
    <div className="mx-auto max-w-[min(92vw,720px)]">
      {/* Grid */}
      <div className="pl-2 sm:pl-4">
        {/* p-px adds an even outer border; gap-px + bg-gray-300 draws 1px grid lines */}
        <div className="grid grid-cols-5 grid-rows-5 gap-px bg-gray-300 p-px rounded">
          {boxes.map(b => (
            <div
              key={b.boxId}
              style={{ gridRowStart: b.row, gridColumnStart: b.col }}
              className="bg-white aspect-square"  
            >
              <Box
                boxId={b.boxId}
                text={b.text}
                checked={b.checked}
                onToggle={onToggle}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ⬇️ Place the popover right here, as a sibling to the grid */}
      {showPopover && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl px-6 py-4 text-center">
            <h2 className="text-2xl font-semibold mb-2">Bingo 🎉</h2>
            <h2 className="text-xl font-semibold mb-2">Proceed to the table outside the entrance to claim your prize!</h2>
            <div className="mt-3 flex gap-2 justify-center">
              <button
                className="px-4 py-2 rounded bg-blue-600 text-white"
                onClick={() => setShowPopover(false)}
              >
                Close
              </button>
              <button
                className="px-4 py-2 rounded border"
                onClick={() => {
                  setBoxes(prev => prev.map(b => ({ ...b, checked: false })));
                  setShowPopover(false);
                  setWinner(false);
                  // NOTE: hasEverWon stays true
                }}
              >
                Reset Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Win Proof Section */}
      {hasEverWon && (
        <div className="fixed bottom-4 left-0 right-0 flex justify-center z-40">
          <div className="flex flex-col items-center gap-2">
            <button
              className="px-4 py-2 rounded bg-emerald-600 text-white shadow"
              onClick={() => setShowWinProof(true)}
            >
              Show Win Proof
            </button>

            {showWinProof && (
              <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-3 py-2">
                Verified: this user has won at least once.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
