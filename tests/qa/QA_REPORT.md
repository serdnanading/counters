# QA Report — Counter App

**Date:** 2026-02-28
**QA Agent:** Claude (Sonnet 4.6)
**Branch:** main (counters-dev)
**Node used for tests:** v25.2.1 (system default is v16.15.1 — see bug BUG-1)

---

## Section 1: Existing Test Results

### 1.1 Unit Tests (`npm run test:unit` → `vitest run`)

| File | Tests | Passed | Failed |
|------|-------|--------|--------|
| `tests/unit/useCounter.test.ts` | 9 | 0 | **9** |
| `tests/unit/usePersistedState.test.ts` | 5 | 0 | **5** |
| **Total** | **14** | **0** | **14** |

**Result: ALL 14 FAILED**

**Root cause:**
Node.js v22+ ships a built-in `localStorage` global (Web Storage API, Node.js RFC 8089).
Vitest 4.x passes `--localstorage-file` to Node internally but without a valid path, resulting in a non-functional built-in `localStorage`. The built-in object takes precedence over the jsdom-provided one, so `localStorage.clear()` throws:

```
TypeError: localStorage.clear is not a function
```

This blocks every test in both files because `beforeEach(() => { localStorage.clear(); })` fails before any test body runs.

The `npm run test:unit` script also fails with a lower-level error on Node v16/v18:

```
SyntaxError: The requested module 'node:fs/promises' does not provide an export named 'constants'
```

because Vite 7.x requires Node.js ≥ 20.19.0 / ≥ 22.12.0.

**Impact:** Zero unit test coverage is being collected; regressions in `useCounter` or `usePersistedState` will go undetected by CI.

---

### 1.2 End-to-End Tests (`npm run test:e2e` → `playwright test`)

Ran with Node v25.2.1 (`node node_modules/.bin/playwright test`).

| Test | Result |
|------|--------|
| page loads with two counters, both showing value 0 and default labels | ✅ PASS |
| clicking increment button increases value by 1 | ✅ PASS |
| clicking decrement button decreases value by configured decrement amount | ✅ PASS |
| value does not go below 0 after decrementing | ✅ PASS |
| edit label via settings, reload page → label persists | ✅ PASS |
| set value, reload page → value persists | ✅ PASS |
| changing decrement amount changes what the decrement button subtracts | ✅ PASS |
| reset button restores counter to defaults | ✅ PASS |
| both counters are independent — changing counter 1 does not affect counter 2 | ✅ PASS |
| **Total** | **9/9 PASS** |

---

## Section 2: QA Scenarios

All scenarios run at mobile viewport **375×812** via `playwright.qa.config.ts`.
Command: `node node_modules/.bin/playwright test --config playwright.qa.config.ts`

---

### Scenario 1 — Happy Path

**Test:** S1 — two counters at 0, increment 5×, set decrement=2, decrement 3× → 0, counter 2 stays 0

| Step | Expected | Actual | Result |
|------|----------|--------|--------|
| Load page — both counters | value=0, value=0 | value=0, value=0 | ✅ |
| Increment counter 1 × 5 | value=5 | value=5 | ✅ |
| Open settings, set decrement=2 | input accepts 2 | accepted | ✅ |
| Decrement 1 → | value=3 | value=3 | ✅ |
| Decrement 2 → | value=1 | value=1 | ✅ |
| Decrement 3 → | value=0 (floor) | value=0 | ✅ |
| Counter 2 independence | value=0 | value=0 | ✅ |

**Overall: PASS**

---

### Scenario 2 — Persistence Across Reload

**Note on missing UI feature:** There is no direct value-input field in the Counter UI.
`setValue` is declared in `CounterProps` and provided by `useCounter`, but `Counter.tsx` never renders an input element for it. Values can only be changed via increment (+1), decrement, or reset. Tests use increments to reach target values.

**Test:** S2 — label and value for both counters persist after full page reload
*(Counter 1 → label "Water Glasses", value 10; Counter 2 → label "Coffees", value 5)*

| Step | Expected | Actual | Result |
|------|----------|--------|--------|
| Set counter 1 label via settings UI | "Water Glasses" displayed | "Water Glasses" | ✅ |
| Increment counter 1 × 10 | value=10 | value=10 | ✅ |
| Set counter 2 label via settings UI | "Coffees" displayed | "Coffees" | ✅ |
| Increment counter 2 × 5 | value=5 | value=5 | ✅ |
| Full page reload | all 4 values persist | all 4 persist | ✅ |

**Overall: PASS**

---

### Scenario 3 — Edge Cases

| Test | Expected | Actual | Result |
|------|----------|--------|--------|
| S3a: value 0, press decrement | stays 0, no crash | 0, no crash | ✅ PASS |
| S3b: decrement amount=0, press decrement | value unchanged, no crash | value unchanged | ✅ PASS |
| S3c: decrement amount=999999, value=5, press decrement | value becomes 0 | 0 | ✅ PASS |
| S3d: decrement amount=999999 in settings — button renders correctly | "-999999" shown, no h-scroll | shown, no h-scroll | ✅ PASS |
| S3e: clear label to empty string | no crash, counter still works | no crash | ✅ PASS |
| S3f: type letters into number input (keyboard) | input ignored gracefully, counter works | graceful | ✅ PASS |
| S3g: `localStorage.clear()` + reload | defaults load, no crash | defaults load | ✅ PASS |

**All edge cases: PASS**

**Notes:**

- **S3b detail:** When decrement amount is 0, the decrement button label shows **"-0"** (minor cosmetic issue).
- **S3d note:** Testing counter *value* = 999999 is not feasible via the UI (would require 999999 clicks); the scenario was adapted to use the decrement-amount input, which does accept large integers. This also exposed the missing value-input bug (BUG-3).
- **S3f detail:** The `<input type="number">` rejects non-numeric keystrokes at the browser level; the app never receives invalid input. No crash.

---

### Scenario 4 — Mobile UI

| Test | Expected | Actual | Result |
|------|----------|--------|--------|
| S4a: all buttons ≥ 44px height | ≥ 44px each | all pass (`.btn` has `min-height: 44px`; `.btn-settings-toggle` inherits it) | ✅ PASS |
| S4b: no horizontal scrollbar at 375px | scrollWidth ≤ clientWidth | no h-scroll | ✅ PASS |
| S4c: body font-size ≥ 14px | ≥ 14px | 16px (`:root` sets 16px) | ✅ PASS |
| S4d: both counters visible (scroll if needed) | both reachable | both visible | ✅ PASS |

**All mobile UI checks: PASS**

---

## Section 3: Additional Observations

### OBS-1 — Unit Tests Completely Broken (Node.js Compatibility)

`npm run test:unit` fails on every available Node.js version in this environment:
- Node v16.15.1: fatal `SyntaxError` from Vite 7 (requires Node ≥ 20.19.0)
- Node v18.20.4: same fatal `SyntaxError`
- Node v25.2.1: all 14 tests fail with `TypeError: localStorage.clear is not a function` (built-in localStorage shadowing jsdom's)

The project's `package.json` specifies Vite `^7.3.1` and Vitest `^4.0.18`, which require Node ≥ 20 and have known conflicts with Node.js 22+'s built-in WebStorage API. A `.nvmrc` or `engines` field constraining the Node version is absent.

### OBS-2 — usePersistedState Does Not Read Externally Pre-Populated localStorage

Confirmed via three independent approaches (Playwright `storageState`, `page.addInitScript`, `page.evaluate + reload`): when localStorage is populated *before* the React app initialises (simulating a user manually setting values in DevTools and then refreshing), the `usePersistedState` hook initialises with default values and ignores the stored data.

Diagnostic evidence:
```
localStorage.getItem('counter-1') = '{"label":"Water Glasses","value":42,...}'  ← data IS in storage
counter-label-1 text content        = "Counter 1"  ← hook returned defaultValue
```

The exact failure mode: Playwright's storage-injection mechanisms set localStorage *after* React's `useState` lazy initialiser has already executed, so the hook captures `null` on first read and returns `defaultValue`. The hook writes correct data to localStorage throughout normal app use, so subsequent reloads (S2b, S2c) work fine. The issue is narrowly reproducible when localStorage is populated by an agent *other* than the running React app and then the page is loaded fresh.

**Recommended action:** Add a synchronisation guard (e.g., a `useEffect` that re-reads from localStorage on mount if state still equals `defaultValue`), or test in a real browser to confirm whether this reproduces outside Playwright.

### OBS-3 — No Direct Value Input in UI

`setValue` is exported from `useCounter` and typed in `CounterProps`, but `Counter.tsx` (line 16–26) never destructures or renders it. There is no `<input>` element that lets users jump directly to a specific counter value. To reach value 42, a user must press `+1` forty-two times. This is a usability gap, not a crash, but it makes the app impractical for high target values.

### OBS-4 — Stale Closure in useCounter Setters

All state-setter functions in `useCounter` (`setLabel`, `setValue`, `setDecrementAmount`, `increment`, `decrement`) use non-functional state updates:

```ts
const increment = () => setState({ ...state, value: state.value + 1 });
```

These close over the `state` snapshot from the current render. In React 18 with automatic batching, if two of these functions are called within the same event (or concurrently via programmatic triggers), the second call may overwrite changes made by the first. Normal one-click-at-a-time usage is safe, but the pattern is fragile. Best practice is to use functional updates: `setState(prev => ({ ...prev, value: prev.value + 1 }))`.

### OBS-5 — Decrement Button Shows "-0" When Decrement Amount Is 0

When a user sets decrement amount to 0, the button label renders as **"-0"** (from `{-${decrementAmount}}`). This is cosmetically odd. The value correctly stays unchanged (Math.max(0, v - 0) = v), so there is no functional bug.

### OBS-6 — Page Title Is Generic ("vite-scaffold")

`index.html` line 8: `<title>vite-scaffold</title>`. This is a placeholder from the Vite scaffold template and should be updated to reflect the actual app name.
