'use client';
import { useState, useRef, useEffect } from 'react';
import Box from '@/components/Box';
import { checkWin } from '@/utils/checkWin';

function makeBoxes(size = 5, texts = []) {
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

  const [day, setDay] = useState('day1');
  const [boxes, setBoxes] = useState(() => makeBoxes(size));
  const [winner, setWinner] = useState(false);
  const [loadingDay, setLoadingDay] = useState(true);

  // Popover state + first-win tracking
  const [showPopover, setShowPopover] = useState(false);
  const hasShownPopoverRef = useRef(false);
  const notifiedFirstWinRef = useRef(false);

  // Fetch current day from /api/day on mount
  useEffect(() => {
    let isCancelled = false;

    async function fetchDay() {
      try {
        const res = await fetch('/api/day', { cache: 'no-store' });
        if (!res.ok)
          throw new Error(`Failed to fetch day: ${res.status}`);
              
        const data = await res.json();

        if (!isCancelled && (data.day === 'day1' || data.day === 'day2')) 
          setDay(data.day);
        
      } catch (err) {
        console.error('Error fetching current day:', err);
      } finally {
        if (!isCancelled) 
          setLoadingDay(false);
      }
    }
    fetchDay();
    return () => { isCancelled = true; };
  }, []);

  //fetch prompts.json whenever day changes
  useEffect(() => {
    async function fetchPrompts() {
      try {
        const response = await fetch("/prompts.json");

        if (!response.ok)
          throw new Error(`HTTP error! ${response.status}`);
        
        const data = await response.json();
        const prompts = data[day] || [];
        setBoxes(makeBoxes(size, prompts));
      } catch (err) {
        console.error("Error fetching prompts:", err);
      }
    }
    fetchPrompts();
  }, [day]);

  // Log a click for a given promptId to Redis
  async function recordPromptClick(promptId) {
    // Ignore Free Space (center tile r3c3 for both days) --> will not be recorded on redis
    if (promptId.endsWith(':r3c3')) return;

    try {
      await fetch('/api/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptId }),
      });
    } catch (err) {
      console.error('Failed to record click:', err);
    }
  }

  function onToggle(boxId) {
    // Log this tile click for the given day
    const promptId = `${day}:${boxId}`;
    recordPromptClick(promptId);

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
      <div className="mt-2 mb-2 px-2 sm:px-4">
        {/* <h2 className="heading-sub">
          {loadingDay
            ? 'Loading day...'
            : day === 'day1'
            ? 'Day 1'
            : 'Day 2'}
        </h2> */}
      </div>

      {/* Grid */}
      <div className="pl-2 sm:pl-4">
        <div className="grid grid-cols-5 grid-rows-5 gap-px bg-gray-400 p-px rounded">
          {boxes.map(b => (
            <div
              key={b.boxId}
              style={{ gridRowStart: b.row, gridColumnStart: b.col }}
              className="aspect-square"
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

      {/* Popover: appears only on the FIRST win. Does not disappear after Reset Card button.  */}
      {showPopover && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl px-6 py-4 text-center">
            <h2 className="text-2xl font-semibold mb-2">Bingo 🎉</h2>
            <h2 className="text-xl font-semibold mb-2">
              Proceed to the table outside the entrance to claim your prize!
            </h2>
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

