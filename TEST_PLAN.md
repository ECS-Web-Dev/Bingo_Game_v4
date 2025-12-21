# Testing Plan

**Code Review -> Pre-Deployment Tasks:**

1. Switch Redis Client to Upstash HTTP Client:
    - Vercel runs code in short-lived serverless functions. Persistent Redis connections can cause instability under load. The HTTP client is safer and simpler for serverless apps.

    - What to do
      - Replace the current Redis client with the Upstash HTTP-based Redis client.
      - Remove manual connection handling (connect, isOpen, etc.).
    - Definition of Done
      - App can read/write Redis using the HTTP client
      - Click tracking still works as before
      - No Redis connection errors in logs

2. Count a Click Only the First Time a Tile Is Checked
    - Clicks are counted every toggle, not “first check only.” This would allow users to continue to log clicks after first initial win. Potentially, this would make the leaderboard not reflect what people actually did, just what they clicked multple times.
    - Update this to only count the first time checked? 
    - Decrement if unchecked?
  
3. Reduce Logging Noise (Log Once per Minute)
    - The Admin route.js logs info on every request. Update to run at most once per minute. 
    - Check other console.logs that might cause potential noise during event. 
  
4. Add Redis Key Namespacing (Day + Environment)
    - The current Redis key is 'prompt-clicks'. All clicks are stored under that one key. 
    - Update Redis keys to include: 
      - environment (test or prod)
      - day1 or day2
      - Ex: bingo:{env}:{day}:prompt-clicks
        - bingo:test:day1:prompt-clicks
        - bingo:test:day2:prompt-clicks
        - bingo:prod:day1:prompt-clicks
        - bingo:prod:day2:prompt-clicks
    - Definition of Done:
      - Test and production data are separated
      - Day 1 and Day 2 data are stored independently
      - Leaderboard still displays correctly

##  Operational Readiness Checklist
  
 **GOAL: Ensure critical parts of the app work day of convention**

Test 1: Concurrency Test
  - 200+ concurrent POSTs to /api/click
  - All hitting the same prompt

  - Pass condition:
    - Redis count increases by exactly the number of requests
    - No crashes
    - No Redis errors

  - Tools: k6 OR Artillery
      - Run it once against:
        - Vercel preview
        - Vercel production

Test 2: Day Switch Rehearsal
- Steps:
  - Deploy production
  - Set event start to tomorrow
  - Verify:
    - Shows Day 1
    - Rolls to Day 2 automatically
  - Override via admin to Day 1
  - Remove override

- Pass condition:
  - no caching issues
  - correct day every time 

Test 3: User testing
  - Tasks for testers (would work with just 2-3 people):
    - Open on different mobile devices
    - Tap same square repeatedly
    - Refresh leaderboard



## Feature List and Acceptance Criteria
- UI: Readable on different screens, Interactions are working
- Cross browser testing: making sure it works across different browsers
- Nextjs/Redis: Performance speed, Caching
- Redis: If days are changing
- Source Code: Game logic is working, Wins are being logged
- Basic acceptance criteria (see below):

  - Feature 1: Interactive Bingo Grid
    -  “Grid renders & toggles on mobile”


  - Feature 2: Bingo Win Popup
    - “Win triggers accessible modal”
    -  “Correct win detection logic”

  - Feature 3: Winner Verification
    -  “First win persists + page feed updates”
    - “Resets at midnight”

  - Feature 4: Prompt Library
    - “Schema valid + fallback works”
    - “/prompts page renders and reflects edit”

  - Feature 5: Prompt Leaderboard
    - “Descending order”
    - “Leaderboard renders & empty state”

  - Feature 6: Accessible Design
    - “Zero critical a11y violations on home”
    - “keyboard reachable & responsive”

