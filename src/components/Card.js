'use client';
import { useState, useRef, useEffect } from 'react';
import Box from '@/components/Box';
import { checkWin } from '@/utils/checkWin';


// Sample to fetch from the DB
const SAMPLE_TEXTS = [
  "Asked a question during a panel or session",
  "Corrected a mistake while doing a major based project",
  "Asked a professional how they prepared for their career",
  "Found a professional who is an alumni CSUF",
  "Met someone with a different major",
  "Find someone graduating or an alumni",
  "Follow someone new on LinkedIn",
  "Met someone who has/had an internship",
  "Follow @CSUFECS SUMMIT on Instagram",
  "Cried about an exam",
  "Discover a shared hobby outside of school",
  "Find someone who did an all nighter for a test/project",
  "Free Space",
  "Talked about a personal project based on their studies",
  "Met someone who has attended a prior summit",
  "Met a professional who was involved in student club/org as a student",
  "Follow @SHPE_CSUF on Isntagram",
  "Found someone with the same major as you",
  "Discussed the importance of soft skills in CS or Engineering",
  "Learned about an internship opportunity",
  "Find a mentor or gave mentorship advice",
  "Met someone with their same career interests as you",
  "Took a group photo with new connections",
  "Asked a professional about their career journey",
  "Met professional, student, or intern working in your major"
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
        boxId: `r${r + 1}c${c + 1}`,    // stable ID 
        text,                           // the prompt text
        checked: false,                 // always start unchecked
        row: r + 1,                     // optional: explicit position
        col: c + 1,
      });
      n++;
    }
  }
  return boxes;
}

export default function Card({ onFirstWin, disablePopover = false }) {
  const size = 5;
  const [boxes, setBoxes] = useState(() => makeBoxes(size));
  const [winner, setWinner] = useState(false);
  // Popover state
  const [showPopover, setShowPopover] = useState(false);
  const hasShownPopoverRef = useRef(false);

  // Track if we already notified parent about the first win
  const notifiedFirstWinRef = useRef(false);

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

    if (won) {
      // 1) Let parent know about the first-ever win (only once)
      if (!notifiedFirstWinRef.current) {
        onFirstWin?.();
        notifiedFirstWinRef.current = true;
      }

      // 2) Show Card’s popover only once AND only if parent hasn't disabled it
      if (!hasShownPopoverRef.current && !disablePopover) {
        setShowPopover(true);
        hasShownPopoverRef.current = true;
      }
    }
  }, [boxes, onFirstWin, disablePopover]);

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

      {/* Popover: appears only on the FIRST win, never again, and never after Win Proof is shown */}
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
                  // NOTE: hasEverWon and hasShownPopover stays true
                }}
              >
                Reset Card
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
