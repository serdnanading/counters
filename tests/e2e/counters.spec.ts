import { test, expect } from '@playwright/test';

// All tests use the mobile viewport (375x812) configured in playwright.config.ts

test.describe('Counter App — E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('page loads with two counters, both showing value 0 and default labels', async ({ page }) => {
    await expect(page.getByTestId('counter-value-1')).toHaveText('0');
    await expect(page.getByTestId('counter-value-2')).toHaveText('0');
    await expect(page.getByTestId('counter-label-1')).toHaveText('Counter 1');
    await expect(page.getByTestId('counter-label-2')).toHaveText('Counter 2');
  });

  test('clicking increment button increases value by 1', async ({ page }) => {
    await page.getByTestId('increment-btn-1').click();
    await expect(page.getByTestId('counter-value-1')).toHaveText('1');

    await page.getByTestId('increment-btn-1').click();
    await expect(page.getByTestId('counter-value-1')).toHaveText('2');
  });

  test('clicking decrement button decreases value by configured decrement amount', async ({ page }) => {
    // Increment to 5 first
    for (let i = 0; i < 5; i++) {
      await page.getByTestId('increment-btn-1').click();
    }
    await expect(page.getByTestId('counter-value-1')).toHaveText('5');

    // Open settings and set decrement amount to 2
    await page.getByTestId('settings-toggle-1').click();
    await page.getByTestId('decrement-amount-input-1').fill('2');
    // Trigger blur/change to confirm
    await page.getByTestId('decrement-amount-input-1').press('Enter');

    await page.getByTestId('decrement-btn-1').click();
    await expect(page.getByTestId('counter-value-1')).toHaveText('3');
  });

  test('value does not go below 0 after decrementing', async ({ page }) => {
    // Start at 0, decrement should keep it at 0
    await page.getByTestId('decrement-btn-1').click();
    await expect(page.getByTestId('counter-value-1')).toHaveText('0');
  });

  test('edit label via settings, reload page → label persists', async ({ page }) => {
    await page.getByTestId('settings-toggle-1').click();
    await page.getByTestId('label-input-1').fill('My Water');
    await page.getByTestId('label-input-1').press('Enter');

    await page.reload();

    await expect(page.getByTestId('counter-label-1')).toHaveText('My Water');
  });

  test('set value, reload page → value persists', async ({ page }) => {
    for (let i = 0; i < 7; i++) {
      await page.getByTestId('increment-btn-1').click();
    }
    await expect(page.getByTestId('counter-value-1')).toHaveText('7');

    await page.reload();

    await expect(page.getByTestId('counter-value-1')).toHaveText('7');
  });

  test('changing decrement amount changes what the decrement button subtracts', async ({ page }) => {
    // Set value to 10
    for (let i = 0; i < 10; i++) {
      await page.getByTestId('increment-btn-1').click();
    }

    // Open settings and set decrement amount to 4
    await page.getByTestId('settings-toggle-1').click();
    await page.getByTestId('decrement-amount-input-1').fill('4');
    await page.getByTestId('decrement-amount-input-1').press('Enter');

    await page.getByTestId('decrement-btn-1').click();
    await expect(page.getByTestId('counter-value-1')).toHaveText('6');
  });

  test('reset button restores counter to defaults (value 0, decrementAmount 1, original label)', async ({ page }) => {
    // Modify counter 1
    await page.getByTestId('settings-toggle-1').click();
    await page.getByTestId('label-input-1').fill('Changed Label');
    await page.getByTestId('label-input-1').press('Enter');
    await page.getByTestId('decrement-amount-input-1').fill('5');
    await page.getByTestId('decrement-amount-input-1').press('Enter');

    for (let i = 0; i < 3; i++) {
      await page.getByTestId('increment-btn-1').click();
    }

    // Reset
    await page.getByTestId('reset-btn-1').click();

    await expect(page.getByTestId('counter-value-1')).toHaveText('0');
    await expect(page.getByTestId('counter-label-1')).toHaveText('Counter 1');

    // Verify decrement amount is back to 1: increment to 3, decrement once → should be 2
    for (let i = 0; i < 3; i++) {
      await page.getByTestId('increment-btn-1').click();
    }
    await page.getByTestId('decrement-btn-1').click();
    await expect(page.getByTestId('counter-value-1')).toHaveText('2');
  });

  test('both counters are independent — changing counter 1 does not affect counter 2', async ({ page }) => {
    // Increment counter 1 five times
    for (let i = 0; i < 5; i++) {
      await page.getByTestId('increment-btn-1').click();
    }

    // Change counter 1 label
    await page.getByTestId('settings-toggle-1').click();
    await page.getByTestId('label-input-1').fill('Counter One');
    await page.getByTestId('label-input-1').press('Enter');

    // Counter 2 should remain unchanged
    await expect(page.getByTestId('counter-value-2')).toHaveText('0');
    await expect(page.getByTestId('counter-label-2')).toHaveText('Counter 2');
  });
});
