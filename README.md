# Counter App — Shared Spec

## Data Model

Each counter stores:
````typescript
interface CounterState {
  label: string;           // user-editable, default "Counter 1" / "Counter 2"
  value: number;           // integer, floors at 0
  decrementAmount: number; // positive integer, default 1
}
````

## Hooks

### usePersistedState<T>(key: string, defaultValue: T): [T, (val: T) => void]

- Generic hook wrapping useState with localStorage read/write
- Reads from localStorage on mount, writes on every update
- Handles missing keys (returns default) and corrupted JSON (returns default)

### useCounter(storageKey: string, defaultLabel: string): object

- Uses usePersistedState internally with the given storageKey
- Returns: { label, value, decrementAmount, setLabel, setValue, setDecrementAmount, decrement, increment, reset }
- decrement(): subtracts decrementAmount from value, floors at 0
- increment(): adds 1 to value
- reset(): restores to { label: defaultLabel, value: 0, decrementAmount: 1 }

## Components

### Counter

- Receives all return values of useCounter as props
- Displays label (editable), value (large text), decrementAmount
- Buttons: Increment (+1), Decrement (-N where N is the configured amount), Reset
- Collapsible settings section: set decrement amount, edit label

### Layout

- Renders two Counter components stacked vertically, mobile-first single column
- Header: "My Counters"
- Counter 1 uses storageKey "counter-1", default label "Counter 1"
- Counter 2 uses storageKey "counter-2", default label "Counter 2"

## Required data-testid attributes

These must be present on the corresponding elements for e2e tests:

- `counter-value-1`, `counter-value-2` — the value display element
- `counter-label-1`, `counter-label-2` — the displayed label text
- `increment-btn-1`, `increment-btn-2` — the +1 button
- `decrement-btn-1`, `decrement-btn-2` — the decrement button
- `reset-btn-1`, `reset-btn-2` — the reset button
- `decrement-amount-input-1`, `decrement-amount-input-2` — input for decrement amount
- `label-input-1`, `label-input-2` — input for editing the label
- `settings-toggle-1`, `settings-toggle-2` — button to expand/collapse settings

## File Structure
````
src/
├── App.tsx
├── components/
│   ├── Counter.tsx
│   └── Layout.tsx
├── hooks/
│   ├── useCounter.ts
│   └── usePersistedState.ts
└── main.tsx
tests/
├── unit/
│   ├── useCounter.test.ts
│   └── usePersistedState.test.ts
├── e2e/
│   └── counters.spec.ts
└── qa/
    ├── qa-scenarios.spec.ts
    └── QA_REPORT.md
````
````
````

---

## Execution Flow
````
Phase 0: You set up two clones, add shared spec, push
              │
              ▼
┌──────────────────────────────────────────────┐
│            PHASE 1 (parallel)                │
│                                              │
│  Terminal 1:              Terminal 2:         │
│  cd ~/counters-dev        cd ~/counters-tests│
│  claude                   claude             │
│  → Give Agent 1 prompt    → Give Agent 2     │
│  → Works on main          → Works on tests   │
│  → Builds the app           branch           │
│                           → Writes tests     │
└──────────────────────────────────────────────┘
              │
              ▼
Phase 2: You merge (manual)
  cd ~/counters-dev
  git add -A && git commit -m "Agent 1: app built" && git push origin main
  cd ~/counters-tests
  git add -A && git commit -m "Agent 2: tests written" && git push origin tests
  cd ~/counters-dev
  git fetch origin
  git merge origin/tests
  # Resolve any conflicts (likely in vite.config.ts and package.json)
  git commit && git push origin main
              │
              ▼
Phase 3: Agent 1 — fix tests (Terminal 1)
  cd ~/counters-dev && git pull
  claude → Give "Post-Merge" prompt
              │
              ▼
Phase 4: Agent 3 — QA (Terminal 1 or new terminal)
  cd ~/counters-dev
  claude → Give Agent 3 prompt
              │
              ▼
Phase 5: Agent 1 — fix QA bugs (Terminal 1)
  cd ~/counters-dev
  claude → Give "Post-QA" prompt
              │
              ▼
Phase 6: You deploy to Vercel (manual)
````

---

## Agent Instructions

### Agent 1 — Development Agent

Run in: `~/counters-dev` (branch: main)
Launch: open a terminal, `cd ~/counters-dev`, run `claude`
Paste this prompt:
````
You are building a mobile-friendly counter webapp in this repository.

FIRST: Read README.md in this repo root. It contains the full spec including data model, hook signatures, component specs, required data-testid attributes, and file paths. Follow it exactly. Another agent is writing tests against that same spec in parallel — if you deviate, the tests will fail.

TECH STACK: Vite + React + TypeScript. No backend. Use localStorage for persistence.

STEP 1 — SCAFFOLD:
- Run: npm create vite@latest . -- --template react-ts (say yes to overwrite if prompted)
- npm install
- Verify: npm run dev works

STEP 2 — BUILD HOOKS:

src/hooks/usePersistedState.ts:
- Implement the usePersistedState hook exactly as specified in README
- Must handle: missing localStorage keys → return default, corrupted JSON → return default, normal read/write

src/hooks/useCounter.ts:
- Implement exactly as specified in README
- storageKey parameter lets each counter have its own localStorage key
- decrement() subtracts decrementAmount, floors value at 0
- All state changes must persist to localStorage via usePersistedState

STEP 3 — BUILD COMPONENTS:

src/components/Counter.tsx:
- Takes a counter number prop (1 or 2) and all useCounter return values
- Displays: label (editable), value in large text, current decrement amount
- Buttons: "+1" (increment), "-N" (decrement, label shows configured amount), "Reset"
- Collapsible settings: number input for decrement amount, text input for label
- Add ALL data-testid attributes listed in README (counter-value-1, increment-btn-1, etc.)
- All buttons minimum 44px height

src/components/Layout.tsx:
- Mobile-first single column
- Header: "My Counters"
- Two Counter components: storageKey "counter-1" / "counter-2", default labels "Counter 1" / "Counter 2"

src/App.tsx:
- Renders Layout

STEP 4 — STYLING:
- Mobile-first, no horizontal scroll at 375px width
- System fonts, clean minimal design
- Large touch targets (min 44px)
- Value is the visually largest element per counter
- CSS modules or single CSS file, NO UI component library

STEP 5 — VERIFY:
- npm run dev, manually check in browser at mobile width
- Both counters render, buttons work
- Change labels, set values, refresh → state persists
- Decrement to 0, decrement again → stays at 0
- Clear localStorage, refresh → clean defaults

CONSTRAINTS:
- Follow README spec exactly: hook names, return values, file paths, data-testid attributes
- Export all hooks so they can be imported by tests
- No state management libraries (no Redux, Zustand, etc.)
- No UI component libraries (no MUI, Chakra, etc.)
- No timers, no auto-decrement — everything is manual button presses
- Do NOT create or modify anything in the tests/ directory
- When done, run: git add -A && git commit -m "feat: complete app implementation"
  Do NOT push — I will handle that.
````

---

### Agent 2 — Test Writer Agent

Run in: `~/counters-tests` (branch: tests)
Launch: open a second terminal, `cd ~/counters-tests`, run `claude`
Paste this prompt:
````
You are writing tests for a counter webapp that is being built by another agent in parallel. You have NOT seen the source code. Write all tests based ONLY on the spec in README.md in this repo root.

FIRST: Read README.md carefully. It contains the data model, hook signatures, component specs, required data-testid attributes, and file structure. Your tests must match these exactly.

You are on the "tests" branch. Verify with: git branch

STEP 1 — SCAFFOLD A MINIMAL PROJECT (needed for dependencies and TypeScript):
- Run: npm create vite@latest . -- --template react-ts (say yes to overwrite)
- npm install
- npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom playwright @playwright/test
- npx playwright install chromium

- Add to vite.config.ts, inside defineConfig:
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.ts'
  }

- Create tests/setup.ts containing:
  import '@testing-library/jest-dom';

- Create playwright.config.ts:
  - Use mobile viewport: { width: 375, height: 812 }
  - webServer: { command: 'npm run dev', port: 5173, reuseExistingServer: true }
  - testDir: 'tests/e2e'

- Add to package.json scripts:
  "test:unit": "vitest run",
  "test:e2e": "npx playwright test"

STEP 2 — CREATE STUB SOURCE FILES:
The real source will come from Agent 1 during merge. Create minimal stubs so your test imports compile. Put a comment at the top of each: // STUB — will be replaced during merge

Create these stubs matching the README spec signatures:
- src/hooks/usePersistedState.ts — export the hook with correct signature, return [defaultValue, () => {}]
- src/hooks/useCounter.ts — export the hook with correct signature, return object with all fields as no-ops
- src/components/Counter.tsx — export a div with all required data-testid attributes
- src/components/Layout.tsx — export a div rendering two Counter stubs
- src/App.tsx — render Layout
- src/main.tsx — standard Vite entry point

STEP 3 — UNIT TESTS:

tests/unit/usePersistedState.test.ts:
- Returns default value when localStorage has no entry for the key
- Reads existing value from localStorage on mount
- Writes updated value to localStorage when setter is called
- Returns default if localStorage contains invalid/corrupted JSON for the key
- Two hooks with different keys do not interfere with each other

tests/unit/useCounter.test.ts:
- Initializes with value: 0, decrementAmount: 1, label matching the defaultLabel argument
- setLabel updates label
- setValue updates value
- setDecrementAmount updates decrementAmount
- increment adds 1 to value
- decrement subtracts decrementAmount from value
- decrement floors at 0: value 3, decrementAmount 5 → value becomes 0, not -2
- reset restores to { label: defaultLabel, value: 0, decrementAmount: 1 }
- Persistence: create hook with storageKey "test-counter", set value to 42, unmount, re-create hook with same storageKey → value is 42

STEP 4 — E2E TESTS:

tests/e2e/counters.spec.ts (all tests use mobile viewport from playwright config):
- Page loads with two counters, both showing value 0 and default labels
- Clicking increment button increases value by 1
- Clicking decrement button decreases value by configured decrement amount
- Value does not go below 0 after decrementing
- Edit label via settings, reload page → label persists
- Set value, reload page → value persists
- Changing decrement amount changes what the decrement button subtracts
- Reset button restores counter to defaults (value 0, decrementAmount 1, original label)
- Both counters are independent — changing counter 1 does not affect counter 2

Use the data-testid attributes from README.md to locate elements (e.g., page.getByTestId('counter-value-1')).

STEP 5 — VERIFY COMPILATION:
- Run: npm run test:unit
- Tests will fail (stubs don't implement logic), but they must COMPILE without TypeScript errors
- If there are import or type errors, fix your test code (not the stubs)

STEP 6 — DOCUMENT:
- Create tests/TEST_SETUP_NOTES.md documenting:
  - Which stub files you created and where
  - Any assumptions you made beyond what's in README
  - Any issues you encountered

CONSTRAINTS:
- Write tests ONLY based on README.md spec
- Source stubs must be minimal — just enough for TypeScript compilation
- All e2e tests use mobile viewport (375x812)
- All e2e tests use data-testid attributes for element selection
- When done, run: git add -A && git commit -m "test: add unit and e2e tests"
  Do NOT push — I will handle that.
````

---

### Post-Merge Prompt for Agent 1

After you merge the tests branch into main, go back to Terminal 1:
````bash
cd ~/counters-dev
git pull  # or if you merged locally, just make sure you're up to date
````

Launch `claude` and paste:
````
The tests branch has been merged into this codebase. Tests now exist alongside your source code.

Do the following IN ORDER:

1. Read tests/TEST_SETUP_NOTES.md — note any assumptions or issues from the test agent
2. Delete any files in src/ that contain the comment "// STUB" — these were placeholders and your real implementations should replace them. If the merge kept the stubs instead of your files, restore your implementations.
3. Run: npm install (in case new dependencies were added)
4. Run: npm run test:unit
   - Read every failure carefully
   - Fix ONLY source code (src/**) to make tests pass
   - Do NOT modify any files in tests/
5. Run: npm run test:e2e
   - Fix ONLY source code to make tests pass
   - Ensure all data-testid attributes from README.md are present on the correct elements
   - Do NOT modify any files in tests/
6. Run both again to confirm all pass
7. git add -A && git commit -m "fix: all tests passing"
````

---

### Agent 3 — QA / Bug Hunter Agent

Run in: `~/counters-dev` (after Agent 1's post-merge fixes are committed)
Launch `claude` and paste:
````
You are a QA agent for a counter webapp in this repository. Your job is to run the app, find bugs, and document them. Do NOT fix any bugs. Do NOT modify files in src/ or tests/unit/ or tests/e2e/.

FIRST: Read README.md for the app spec.

STEP 1 — START THE APP:
- npm install
- npm run dev &  (run in background)
- Wait a few seconds, verify http://localhost:5173 is reachable (curl or wget)
- If the app fails to start, write that as a Critical bug in QA_REPORT.md and stop

STEP 2 — RUN EXISTING TESTS:
- npm run test:unit — record pass/fail counts
- npm run test:e2e — record pass/fail counts
- Note failures but do NOT fix them

STEP 3 — WRITE QA SCENARIOS:
Create tests/qa/qa-scenarios.spec.ts using Playwright with mobile viewport (375x812).

SCENARIO 1 — Happy path:
- Load page, verify two counters at value 0
- Increment counter 1 five times → value is 5
- Open settings, set decrement amount to 2
- Decrement three times → value should be max(5-6, 0) = 0
- Verify counter 2 is still 0 (independence check)

SCENARIO 2 — Persistence across reload:
- Set counter 1 label to "Water Glasses", value to 42
- Set counter 2 label to "Coffees", value to 7
- Reload the page completely
- Verify all four values persisted correctly

SCENARIO 3 — Edge cases:
- Value at 0, press decrement → stays at 0, no crash
- Set decrement amount to 0 → press decrement → no crash, value unchanged
- Set decrement amount to 999999, value to 5 → decrement → value is 0
- Set value to 999999 → UI renders without breaking layout
- Clear label to empty string → no crash, handles gracefully
- Type letters into value/decrement number inputs → handled gracefully
- Clear all localStorage via page.evaluate(() => localStorage.clear()), reload → defaults load, no crash

SCENARIO 4 — Mobile UI:
- All buttons/interactive elements at least 44px in height
- No horizontal scrollbar at 375px viewport width
- Body text font-size >= 14px
- Both counters visible (page scrollable if needed, not cut off)

Run: npx playwright test tests/qa/qa-scenarios.spec.ts

STEP 4 — DOCUMENT:
Create tests/qa/QA_REPORT.md:
- Section 1: Existing test results (unit pass/fail, e2e pass/fail)
- Section 2: Each QA scenario — PASS or FAIL
  - For failures: what happened, what was expected, reproduction steps
  - Severity: Critical / Major / Minor / Cosmetic
- Section 3: Any additional observations

Create tests/qa/REQUIRED_FIXES.md:
- One bug per line, format: [SEVERITY] Description
- Sorted by severity (Critical first)
- Only include actual bugs, not suggestions

git add -A && git commit -m "qa: QA report and scenarios"
Do NOT push — I will handle that.
````

---

### Post-QA Prompt for Agent 1
````
The QA agent has completed testing. Read these files:
- tests/qa/REQUIRED_FIXES.md
- tests/qa/QA_REPORT.md

Fix all Critical and Major bugs. Fix Minor bugs if they're straightforward. Cosmetic issues are optional.

Rules:
- Do NOT modify any files in tests/
- After fixing, run ALL tests to check for regressions:
  npm run test:unit
  npm run test:e2e
  npx playwright test tests/qa/qa-scenarios.spec.ts
- git add -A && git commit -m "fix: address QA findings"
````

---

## Deployment (Manual — You)

After all agents are done:
````bash
cd ~/counters-dev
git push origin main
````

1. Go to https://vercel.com, sign in with GitHub
2. Click "Add New Project" → select `serdnanading/counters`
3. Framework: Vite (should auto-detect)
4. Click Deploy
5. You'll get a URL like `counters-xxxxx.vercel.app`
6. Open on your phone — done

Future pushes to `main` auto-deploy.

---

## Quick Reference: What You Do vs What Agents Do

| Task | Who |
|------|-----|
| Create repo, two local clones | You |
| Add shared spec to README.md | You |
| Build the app | Agent 1 |
| Write tests | Agent 2 |
| Push branches, merge tests→main | You |
| Fix failing tests | Agent 1 |
| Run QA scenarios, write bug reports | Agent 3 |
| Fix QA bugs | Agent 1 |
| Push to GitHub | You |
| Deploy on Vercel | You |
| Final phone check | You |
