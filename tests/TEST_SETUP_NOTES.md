# Test Setup Notes

## Stub Files Created

All stubs are located in `src/` and contain the comment `// STUB — will be replaced during merge`.

| File | Purpose |
|------|---------|
| `src/hooks/usePersistedState.ts` | Exports hook with correct signature `(key: string, defaultValue: T): [T, (val: T) => void]`; returns `[defaultValue, () => {}]` |
| `src/hooks/useCounter.ts` | Exports hook with correct signature `(storageKey: string, defaultLabel: string): UseCounterReturn`; returns object with all fields as no-ops |
| `src/components/Counter.tsx` | Renders a div with all required `data-testid` attributes using literal values from props |
| `src/components/Layout.tsx` | Renders a div with header and two Counter stubs using the correct storageKeys and default labels |
| `src/App.tsx` | Renders `<Layout />` |
| `src/main.tsx` | Standard Vite entry point (stripped of default asset imports) |

## Assumptions Beyond README

1. **Counter props interface**: The README says Counter "receives all return values of useCounter as props". Added a `counterNumber: 1 | 2` prop as well, since the component needs to know which number suffix to use for `data-testid` attributes (e.g., `counter-value-1` vs `counter-value-2`).

2. **Settings panel visibility**: The README mentions a "collapsible settings section". E2E tests assume `settings-toggle-N` button must be clicked before `label-input-N` and `decrement-amount-input-N` are interactable (they may be hidden by default). If Agent 1's implementation always shows the inputs, the e2e tests still work — clicking a visible toggle is harmless.

3. **Label input trigger**: After filling the label or decrement-amount inputs in e2e tests, we press `Enter` to confirm. If Agent 1 uses `onChange` (live update), this is still fine. If Agent 1 requires a separate save button, tests may need adjustment.

4. **Value persistence**: `setValue` in unit tests stores a number; the persistence test expects a numeric 42, not string "42".

5. **jsdom version**: The spec requests `jsdom` as the test environment. `jsdom@28` (latest) had an ESM compatibility issue (`@exodus/bytes` required via CJS in `html-encoding-sniffer`). Downgraded to `jsdom@25` which resolves this. Documented in package.json as `"jsdom": "^25.0.1"`.

6. **Vitest include pattern**: Added `include: ['tests/unit/**/*.test.ts']` to `vite.config.ts` so that Playwright e2e spec files are not accidentally picked up by vitest (which caused a `Playwright Test did not expect test.describe() to be called here` error).

7. **Node.js version**: The system has Node 16 as default, but `playwright` and `jsdom@25` require Node 18+. Tests must be run with Node 18 (`nvm use 18` or `PATH=~/.nvm/versions/node/v18.20.4/bin:$PATH npm run test:unit`). The merge recipient (Agent 1 in `~/counters-dev`) should ensure Node 18+ is active.

## Compilation Verification

`npm run test:unit` was run and produced:
- **14 tests ran** (no TypeScript or import errors)
- **5 passed** (tests where stubs happen to satisfy default state assertions)
- **9 failed** (expected — stubs are no-ops; failures will resolve once real implementations are merged in)
- **0 compile errors**

The e2e spec (`tests/e2e/counters.spec.ts`) uses `@playwright/test` imports and must be run via `npm run test:e2e`, not vitest.
