# Required Fixes — Counter App

Bugs sorted by severity (Critical first). Only confirmed defects are listed.

---

[CRITICAL] All 14 unit tests fail: Node.js ≥ 20 required by Vite 7 / Vitest 4, but project has no `.nvmrc` or `engines` field. On Node 22+ the built-in `localStorage` global shadows jsdom's, causing `TypeError: localStorage.clear is not a function` in every test. Fix: pin Node.js version (e.g., add `.nvmrc: 20`) and configure Vitest to disable Node's built-in WebStorage (pass `--no-experimental-webstorage` or equivalent).

[MAJOR] `usePersistedState` ignores localStorage data that is present before the React app initialises. When localStorage is populated externally (e.g., user edits DevTools storage then refreshes), the `useState` lazy initialiser reads `null` and falls back to `defaultValue`. The hook never re-syncs with localStorage after mount. Fix: add a `useEffect` that re-reads localStorage if the current state still equals `defaultValue`, or use functional state initialisation that defers the read.

[MAJOR] No direct value input in the Counter UI. `setValue` is defined in `useCounter` and declared in `CounterProps` but `Counter.tsx` never renders a value input. Users can only reach specific values by clicking `+1` repeatedly (up to N times for value N), making large-value entry impractical. Fix: render a controlled `<input type="number">` for the counter value in the settings panel (or inline), wired to `setValue`.

[MINOR] Stale-closure state updates in `useCounter`. All setter functions (`setLabel`, `setValue`, `setDecrementAmount`, `increment`, `decrement`) capture `state` from the current render cycle and spread it: `setState({ ...state, label })`. Concurrent or rapid calls risk the second call overwriting changes from the first. Fix: replace with functional updates, e.g., `setState(prev => ({ ...prev, value: prev.value + 1 }))`.

[COSMETIC] Decrement button displays "-0" when decrement amount is set to 0. The label is rendered as `{-${decrementAmount}}` which produces the string "-0". Fix: guard the display: `{decrementAmount === 0 ? '0' : `-${decrementAmount}`}`, or prevent 0 from being a valid decrement amount.

[COSMETIC] Page `<title>` is "vite-scaffold" (Vite template default). Fix: update `index.html` `<title>` to an appropriate name such as "My Counters".
