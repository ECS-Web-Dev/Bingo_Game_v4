'use client';
import { useState, useRef, useEffect } from 'react';
import Box from '@/components/Box';
import WinButton from '@/components/ui/WinButton';
import WinPopover from './ui/WinPopover';
import { checkWin } from '@/utils/checkWin';

function makeBoxes(size = 5, texts = []) {
  const boxes = [];
  let n = 1;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const i = r * size + c;
      const text = texts[i] ?? `Prompt ${i + 1}`;
      const isFreeSpace = r === 2 && c === 2;

      boxes.push({
        n,
        boxId: `r${r + 1}c${c + 1}`,
        text,
        checked: isFreeSpace,
        name: isFreeSpace ? 'Free Space' : '',
        isFreeSpace,
        hasLoggedToRedis: isFreeSpace,
        row: r + 1,
        col: c + 1,
      });

      n++;
    }
  }

  return boxes;
}

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export default function Card({
  onFirstWin,
  disablePopover = false,
  onResetReady,
}) {
  const size = 5;

  const [day, setDay] = useState('day1');
  const [boxes, setBoxes] = useState([]); // start empty to avoid SSR/client mismatch
  const [hasHydrated, setHasHydrated] = useState(false);

  const [winner, setWinner] = useState(false);
  const [activeBoxId, setActiveBoxId] = useState(null);

  // Popover state + first-win tracking
  const [showPopover, setShowPopover] = useState(false);
  const hasShownPopoverRef = useRef(false);
  const notifiedFirstWinRef = useRef(false);

  const STORAGE_KEY = `bingo-${day}`;

  /**
   * Persist the *next* boxes value at the same time we set state.
   * This avoids effect-order races and makes persistence reliable on mobile.
   */
  function setBoxesAndPersist(updater) {
    setBoxes(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;

      // Only write after we've finished initial hydration
      if (hasHydrated) {
        try {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch (e) {
          console.error('sessionStorage write failed:', e);
        }
      }

      return next;
    });
  }

  /* -------------------- Fetch current day -------------------- */
  useEffect(() => {
    let isCancelled = false;

    async function fetchDay() {
      try {
        const res = await fetch('/api/day', { cache: 'no-store' });
        if (!res.ok) throw new Error(`Failed to fetch day: ${res.status}`);

        const data = await res.json();
        if (!isCancelled && (data.day === 'day1' || data.day === 'day2')) {
          setDay(data.day);
        }
      } catch (err) {
        console.error('Error fetching current day:', err);
      }
    }

    fetchDay();
    return () => {
      isCancelled = true;
    };
  }, []);

  /* -------------------- Prompts + Hydration (single source of truth) -------------------- */
  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      try {
        const response = await fetch('/prompts.json');
        if (!response.ok) throw new Error(`HTTP error! ${response.status}`);

        const data = await response.json();
        const prompts = data[day] || [];

        // Attempt to restore board from session storage
        const savedRaw = sessionStorage.getItem(STORAGE_KEY);
        const saved = savedRaw ? safeJsonParse(savedRaw) : null;

        let nextBoxes;

        if (Array.isArray(saved) && saved.length === 25) {
          // Merge prompt text (in case wording changes) + enforce Free Space invariants
          nextBoxes = saved.map((b, i) => {
            const isFreeSpace = b.row === 3 && b.col === 3;

            return {
              ...b,
              text: prompts[i] ?? b.text,
              checked: isFreeSpace ? true : !!b.checked,
              name: isFreeSpace ? 'Free Space' : (b.name ?? ''),
              isFreeSpace,
              hasLoggedToRedis: isFreeSpace ? true : !!b.hasLoggedToRedis,
            };
          });
        } else {
          nextBoxes = makeBoxes(size, prompts);
        }

        if (!cancelled) {
          setBoxes(nextBoxes);
        }

        // Mark hydration complete
        if (!cancelled) {
          setHasHydrated(true);
        }

        // Ensure something is stored for this day (so the key exists)
        try {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextBoxes));
        } catch (e) {
          console.error('sessionStorage initial write failed:', e);
        }
      } catch (err) {
        console.error('Error fetching prompts/hydrating:', err);

        // Fallback: at least render a board
        const fallback = makeBoxes(size, []);
        if (!cancelled) {
          setBoxes(fallback);
          setHasHydrated(true);
        }

        try {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
        } catch (e) {
          console.error('sessionStorage fallback write failed:', e);
        }
      }
    }

    hydrate();
    return () => {
      cancelled = true;
    };
  }, [day, STORAGE_KEY]);

  /* -------------------- Redis click logging -------------------- */
  async function recordPromptClick(promptId) {
    // Ignore Free Space (center tile r3c3 for both days)
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

  /* -------------------- Submit/uncheck (atomic + persistent) -------------------- */
  async function submitBox(box) {
    // Require a name to check (Free Space bypasses because it starts checked)
    if (!box.checked && !box.name.trim()) return;

    const promptId = `${day}:${box.boxId}`;
    let shouldLog = false;

    setBoxesAndPersist(prev =>
      prev.map(b => {
        if (b.boxId !== box.boxId) return b;

        // UNCHECK
        if (b.checked) {
          return { ...b, checked: false };
        }

        // CHECK
        if (!b.hasLoggedToRedis && !winner && !b.isFreeSpace) {
          shouldLog = true;
        }

        return {
          ...b,
          checked: true,
          hasLoggedToRedis: b.hasLoggedToRedis || shouldLog,
        };
      })
    );

    if (shouldLog) {
      await recordPromptClick(promptId);
    }

    setActiveBoxId(null);
  }

  function openBoxEditor(boxId) {
    setActiveBoxId(boxId);
  }

  /* -------------------- Reset card -------------------- */
  function resetCard() {
    setBoxesAndPersist(prev =>
      prev.map(b => {
        if (b.isFreeSpace) {
          return {
            ...b,
            checked: true,
            name: 'Free Space',
            hasLoggedToRedis: true,
          };
        }

        return {
          ...b,
          checked: false,
          name: '',
          hasLoggedToRedis: false,
        };
      })
    );

    setWinner(false);
    setShowPopover(false);
  }

  // Expose resetCard to parent (page.js)
  useEffect(() => {
    if (onResetReady) {
      onResetReady(() => resetCard());
    }
  }, [onResetReady]);

  /* -------------------- Win calculation -------------------- */
  useEffect(() => {
    if (!boxes.length) return;

    const doneArr = boxes.filter(b => b.checked).map(b => b.n);
    const won = checkWin(doneArr);
    setWinner(won);

    if (won) {
      // notify parent first win (once)
      if (!notifiedFirstWinRef.current) {
        onFirstWin?.();
        notifiedFirstWinRef.current = true;
      }

      // show card popover only once (unless disabled by parent)
      if (!hasShownPopoverRef.current && !disablePopover) {
        setShowPopover(true);
        hasShownPopoverRef.current = true;
      }
    }
  }, [boxes, onFirstWin, disablePopover]);

  const completedNames = boxes
    .filter(b => b.checked && b.name.trim())
    .map(b => b.name);

  // Avoid SSR/client mismatch / UI flash
  if (!hasHydrated) return null;

  return (
    <div className="mx-auto max-w-[min(92vw,720px)] pb-24">
      {/* Grid */}
      <div className="pl-2 sm:pl-4">
        <div className="grid grid-cols-5 grid-rows-5 gap-px bg-gray-400 p-px rounded">
          {boxes.map(b => (
            <div
              key={b.boxId}
              style={{ gridRowStart: b.row, gridColumnStart: b.col }}
              className="aspect-square"
            >
              <Box box={b} onOpenEditor={openBoxEditor} />
            </div>
          ))}
        </div>
      </div>

      {/* Editor Modal */}
      {activeBoxId && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          {(() => {
            const box = boxes.find(b => b.boxId === activeBoxId);
            if (!box) return null;

            return (
              <div className="bg-white rounded-lg shadow-xl px-5 py-4 w-[90vw] max-w-sm">
                <h3 className="font-semibold mb-2">{box.text}</h3>

                <input
                  type="text"
                  placeholder="Who did you talk to?"
                  value={box.name}
                  onChange={e =>
                    setBoxesAndPersist(prev =>
                      prev.map(b =>
                        b.boxId === box.boxId
                          ? { ...b, name: e.target.value }
                          : b
                      )
                    )
                  }
                  className="w-full border rounded px-2 py-1 mb-3"
                />

                <div className="flex justify-end gap-2">
                  <button
                    className="px-3 py-1 border rounded"
                    onClick={() => setActiveBoxId(null)}
                  >
                    Cancel
                  </button>

                  <button
                    className="px-3 py-1 rounded bg-emerald-600 text-white"
                    onClick={() => submitBox(box)}
                  >
                    {box.checked ? 'Uncheck' : 'Submit'}
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Win Popover */}
      <WinPopover open={showPopover} onClose={() => setShowPopover(false)} />

      {/* Win Button */}
      {winner && (
        <WinButton
          buttonText="Winner!"
          proofText="I've won Bingo!"
          names={completedNames}
        />
      )}
    </div>
  );
}
