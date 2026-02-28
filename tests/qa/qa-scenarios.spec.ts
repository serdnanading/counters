import { test, expect } from '@playwright/test';

// QA Scenarios — Mobile viewport (375x812) as configured in playwright.qa.config.ts
//
// NOTE ON A CONFIRMED APP BUG:
// usePersistedState ignores localStorage data that is pre-populated before
// the app initialises (confirmed via Playwright storageState AND addInitScript AND
// direct page.evaluate + page.reload).  The hook only picks up data written by
// the React app itself (its own setState calls) on subsequent reloads.
// This bug is documented in QA_REPORT.md.  Tests below use UI-only interactions
// (increments, settings panel) to work around the limitation.

// ---------------------------------------------------------------------------
// SCENARIO 1 — Happy Path
// ---------------------------------------------------------------------------
test.describe('QA Scenario 1 — Happy Path', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('S1: two counters at 0, increment 5×, set decrement=2, decrement 3× → 0, counter 2 stays 0', async ({ page }) => {
    // Both counters start at 0
    await expect(page.getByTestId('counter-value-1')).toHaveText('0');
    await expect(page.getByTestId('counter-value-2')).toHaveText('0');

    // Increment counter 1 five times → 5
    for (let i = 0; i < 5; i++) {
      await page.getByTestId('increment-btn-1').click();
    }
    await expect(page.getByTestId('counter-value-1')).toHaveText('5');

    // Open settings and change decrement amount to 2
    await page.getByTestId('settings-toggle-1').click();
    await page.getByTestId('decrement-amount-input-1').fill('2');
    await page.getByTestId('decrement-amount-input-1').press('Tab');

    // Decrement three times: 5 → 3 → 1 → max(1-2,0)=0
    await page.getByTestId('decrement-btn-1').click();
    await expect(page.getByTestId('counter-value-1')).toHaveText('3');
    await page.getByTestId('decrement-btn-1').click();
    await expect(page.getByTestId('counter-value-1')).toHaveText('1');
    await page.getByTestId('decrement-btn-1').click();
    await expect(page.getByTestId('counter-value-1')).toHaveText('0');

    // Counter 2 must still be 0 (independence check)
    await expect(page.getByTestId('counter-value-2')).toHaveText('0');
  });
});

// ---------------------------------------------------------------------------
// SCENARIO 2 — Persistence Across Reload
//
// There is no direct value-input in the UI (setValue exists in the hook but is
// never exposed as an input element in Counter.tsx).  Values are set by
// incrementing.  All four values (two labels, two counts) are verified after
// a full page reload.
// ---------------------------------------------------------------------------
test.describe('QA Scenario 2 — Persistence Across Reload', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('S2: label and value for both counters persist after full page reload', async ({ page }) => {
    // --- Counter 1 ---
    // Set label via settings UI
    await page.getByTestId('settings-toggle-1').click();
    await page.getByTestId('label-input-1').fill('Water Glasses');
    await page.getByTestId('label-input-1').press('Tab');

    // Set value to 10 via increments (no direct value input exists in the UI)
    for (let i = 0; i < 10; i++) {
      await page.getByTestId('increment-btn-1').click();
    }
    await expect(page.getByTestId('counter-value-1')).toHaveText('10');
    await expect(page.getByTestId('counter-label-1')).toHaveText('Water Glasses');

    // --- Counter 2 ---
    await page.getByTestId('settings-toggle-2').click();
    await page.getByTestId('label-input-2').fill('Coffees');
    await page.getByTestId('label-input-2').press('Tab');

    for (let i = 0; i < 5; i++) {
      await page.getByTestId('increment-btn-2').click();
    }
    await expect(page.getByTestId('counter-value-2')).toHaveText('5');
    await expect(page.getByTestId('counter-label-2')).toHaveText('Coffees');

    // Full page reload
    await page.reload();

    // All four persisted values must be correct
    await expect(page.getByTestId('counter-label-1')).toHaveText('Water Glasses');
    await expect(page.getByTestId('counter-value-1')).toHaveText('10');
    await expect(page.getByTestId('counter-label-2')).toHaveText('Coffees');
    await expect(page.getByTestId('counter-value-2')).toHaveText('5');
  });
});

// ---------------------------------------------------------------------------
// SCENARIO 3 — Edge Cases
// ---------------------------------------------------------------------------
test.describe('QA Scenario 3 — Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('S3a: decrement at 0 stays at 0, no crash', async ({ page }) => {
    await expect(page.getByTestId('counter-value-1')).toHaveText('0');
    await page.getByTestId('decrement-btn-1').click();
    await expect(page.getByTestId('counter-value-1')).toHaveText('0');
  });

  test('S3b: decrement amount 0 — pressing decrement does not change value, no crash', async ({ page }) => {
    for (let i = 0; i < 5; i++) {
      await page.getByTestId('increment-btn-1').click();
    }
    await page.getByTestId('settings-toggle-1').click();
    await page.getByTestId('decrement-amount-input-1').fill('0');
    await page.getByTestId('decrement-amount-input-1').press('Tab');

    await page.getByTestId('decrement-btn-1').click();
    // Value must still be 5 (decrement by 0 = no change)
    await expect(page.getByTestId('counter-value-1')).toHaveText('5');
  });

  test('S3c: decrement amount 999999 with value 5 → value floors at 0', async ({ page }) => {
    for (let i = 0; i < 5; i++) {
      await page.getByTestId('increment-btn-1').click();
    }
    await page.getByTestId('settings-toggle-1').click();
    await page.getByTestId('decrement-amount-input-1').fill('999999');
    await page.getByTestId('decrement-amount-input-1').press('Tab');

    await page.getByTestId('decrement-btn-1').click();
    await expect(page.getByTestId('counter-value-1')).toHaveText('0');
  });

  test('S3d: large number (999999) as decrement amount — button label renders without layout breakage', async ({ page }) => {
    // Note: setting counter VALUE to 999999 is not feasible via UI (no direct
    // value input exists; would require 999999 clicks). We test large-number
    // rendering via the decrement amount input which accepts it freely.
    await page.getByTestId('settings-toggle-1').click();
    await page.getByTestId('decrement-amount-input-1').fill('999999');
    await page.getByTestId('decrement-amount-input-1').press('Tab');

    // Decrement button must show -999999 without breaking layout
    await expect(page.getByTestId('decrement-btn-1')).toContainText('999999');

    // No horizontal scrollbar
    const hasHScroll = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHScroll).toBe(false);
  });

  test('S3e: clearing label to empty string — no crash, renders gracefully', async ({ page }) => {
    await page.getByTestId('settings-toggle-1').click();
    await page.getByTestId('label-input-1').fill('');
    await page.getByTestId('label-input-1').press('Tab');

    // No crash: page is still functional — increment still works
    await page.getByTestId('increment-btn-1').click();
    await expect(page.getByTestId('counter-value-1')).toHaveText('1');
  });

  test('S3f: typing non-numeric chars into decrement-amount input — handled gracefully, no crash', async ({ page }) => {
    await page.getByTestId('settings-toggle-1').click();
    const input = page.getByTestId('decrement-amount-input-1');

    // Focus the number input and attempt to type letters via keyboard
    await input.click();
    await page.keyboard.type('abc');
    await input.press('Tab');

    // No crash: counter still increments correctly
    await page.getByTestId('increment-btn-1').click();
    await expect(page.getByTestId('counter-value-1')).toHaveText('1');

    // Decrement should still work using the last valid decrementAmount (1)
    await page.getByTestId('decrement-btn-1').click();
    await expect(page.getByTestId('counter-value-1')).toHaveText('0');
  });

  test('S3g: clearing localStorage then reloading — defaults load, no crash', async ({ page }) => {
    // Give both counters some state first
    await page.getByTestId('increment-btn-1').click();
    await page.getByTestId('increment-btn-2').click();

    // Clear all localStorage and reload
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Defaults should load: both counters at 0 with original labels
    await expect(page.getByTestId('counter-value-1')).toHaveText('0');
    await expect(page.getByTestId('counter-value-2')).toHaveText('0');
    await expect(page.getByTestId('counter-label-1')).toHaveText('Counter 1');
    await expect(page.getByTestId('counter-label-2')).toHaveText('Counter 2');
  });
});

// ---------------------------------------------------------------------------
// SCENARIO 4 — Mobile UI
// ---------------------------------------------------------------------------
test.describe('QA Scenario 4 — Mobile UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('S4a: all interactive buttons are at least 44px tall', async ({ page }) => {
    // Open settings panels on both counters to expose all buttons
    await page.getByTestId('settings-toggle-1').click();
    await page.getByTestId('settings-toggle-2').click();

    const testIds = [
      'increment-btn-1',
      'decrement-btn-1',
      'reset-btn-1',
      'settings-toggle-1',
      'increment-btn-2',
      'decrement-btn-2',
      'reset-btn-2',
      'settings-toggle-2',
    ];

    for (const id of testIds) {
      const el = page.getByTestId(id);
      const box = await el.boundingBox();
      expect(box, `${id} bounding box must exist`).not.toBeNull();
      expect(box!.height, `${id} height must be >= 44px (got ${box!.height})`).toBeGreaterThanOrEqual(44);
    }
  });

  test('S4b: no horizontal scrollbar at 375px viewport width', async ({ page }) => {
    const hasHScroll = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHScroll).toBe(false);
  });

  test('S4c: body text font-size is at least 14px', async ({ page }) => {
    const fontSize = await page.evaluate(() =>
      parseFloat(getComputedStyle(document.body).fontSize)
    );
    expect(fontSize).toBeGreaterThanOrEqual(14);
  });

  test('S4d: both counters are visible / reachable by scrolling (not clipped)', async ({ page }) => {
    // Counter 1 should be visible immediately
    await expect(page.getByTestId('counter-value-1')).toBeVisible();

    // Counter 2 may require scroll — scroll it into view and check visibility
    await page.getByTestId('counter-value-2').scrollIntoViewIfNeeded();
    await expect(page.getByTestId('counter-value-2')).toBeVisible();
  });
});
