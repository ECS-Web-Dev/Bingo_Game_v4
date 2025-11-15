# Testing Plan
GOAL: Test the critical parts of the app:
- UI: Readable on different screens, Interactions are working
- Cross browser testing: making sure it works across different browsers
- Nextjs/Redis: Performance speed, Caching
- Redis: If days are changing
- Source Code: Game logic is working, Wins are being logged
- Acceptance criteria (see below)


Frameworks for automated testing (https://nextjs.org/docs/app/guides/testing):
- Vitest + React Testing Library: unit tests
  - Logic
  - Redis
- Playwright: automate browser tests (end-to-end testing)
  - Cross-browser tests
  - Raw HTTP assertions
  - Vercel Preview

## Feature List + Tests:
Project schedule allows about 1-2 tests per feature:
- Feature 1: Interactive Bingo Grid
  - Playwright (E2E) — “Grid renders & toggles on mobile”
    - Setup: page.setViewportSize({ width: 390, height: 844 })
    - Steps: Visit /; assert getByTestId('grid') has 25 getByTestId('cell').
    - Click first cell; expect it to have data-checked="true" and visible checkmark.
    - Asserts: Count = 25; cell toggled; page has no horizontal scrollbar (CSS document.scrollingElement.scrollWidth === clientWidth).


  - Vitest (unit) — “win detection logic”
    - Target: detectWin(boardState) pure function.
    - Steps: Feed a board with a completed diagonal; expect true. Feed near-miss; expect false.
    - Add hooks: data-testid="grid", data-testid="cell", data-checked="true|false".


- Feature 2: Bingo Win Popup
  - Playwright (E2E) — “Win triggers accessible modal”
    - Steps: Programmatically check 5-in-a-row (click 5 cells).
    - Asserts: getByRole('dialog', { name: /bingo!/i }) visible; text contains both instruction lines.
    - Esc closes it or click close button; focus returns to the last clicked cell (focus trap + return).


  - Vitest (unit) — “detects all three directions”
    - Steps: Call detectWin with a horizontal, a vertical, and a diagonal winning board.
    - Asserts: All true.
    - Hook: modal has role="dialog" and heading Bingo! You’ve won!.

- Feature 3: Winner Verification
  - Vitest (integration, Redis mocked or real) — “first win persists + page feed updates”
    - Steps: Call logWin({ userId, board }); then getWinsToday() returns array with that entry.
    - Asserts: Entry includes userId, board mask, timestamp.


  - Vitest (unit with fake timers) — “resets at midnight”
    - Steps: vi.setSystemTime('2025-11-14T23:59:30Z'); logWin. Advance to 2025-11-15T00:01:00Z; getWinsToday() → empty.
    - Note: Use date-scoped keys like wins:YYYY-MM-DD or TTL expiring at midnight.


- Feature 4: Prompt Library
  - Vitest (unit) — “schema valid + fallback works”
    - Steps: Validate prompts.json with Zod schema {id,text,category?,active}; ensure no duplicate ids.
    - Simulate DB 500 → loader falls back to /public/prompts.json.
    - Asserts: Parse OK; duplicates throw; fallback returns list.


  - Playwright (E2E) — “/prompts page renders and reflects edit”
    - Steps: Visit /prompts; count ≥ 1. Perform admin edit via UI or hit admin API (fixture); reload page.
    - Asserts: Edited prompt text appears within 60s or on refresh.
    - Hooks: list root data-testid="prompt-list", each item data-testid="prompt-item".

- Feature 5: Prompt Leaderboard
  - Vitest (integration, Redis) — “descending order”
    - Steps: incrementPrompt('pA') once; incrementPrompt('pB') twice; fetch top.
    - Asserts: pB first with count 2, then pA with 1.


  - Playwright (E2E) — “Leaderboard renders & empty state”
    - Steps: Visit /leaderboard with clean store.
    - Asserts: Shows “No data yet”.
    - (Optional second step: simulate a couple of increments via API; reload → entries show text + counts.)
    - Hooks: table data-testid="leaderboard", row data-testid="leaderboard-row", empty state data-testid="empty-leaderboard".

- Feature 6: Accessible Design
  - Playwright + axe — “Zero critical a11y violations on home”
    - Steps: Run @axe-core/playwright on /.
    - Asserts: violations.length === 0 for critical/serious (or fail on any).


  - Playwright (responsive keyboard nav) — “keyboard reachable & responsive”
    - Steps: Desktop viewport; Tab through grid: focus outline visible on cells; hitting Space toggles a cell.
    - Switch to mobile viewport (e.g., 390×844); ensure prompts readable and no clipping (check element bounding boxes within viewport).

