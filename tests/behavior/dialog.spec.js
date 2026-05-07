// Dialog behavior tests that need a real browser:
//   - Open via [data-brut-open="<id>"] trigger
//   - Close on [data-brut-close] inside the dialog
//   - Close on scrim click
//   - Close on Escape (uses document-level keydown listener)
//   - brut:open and brut:close events fire with the right shape
//
// Targets the existing preview/components-dialog.html fixture.

import { test, expect } from '@playwright/test';

test.describe('dialog', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/preview/components-dialog.html', { waitUntil: 'load' });
  });

  test('opens via [data-brut-open] and closes via [data-brut-close]', async ({ page }) => {
    const trigger = page.locator('[data-brut-open]').first();
    const dialogId = await trigger.getAttribute('data-brut-open');
    const dialog = page.locator(`#${dialogId}`);

    await expect(dialog).toHaveAttribute('hidden', '');
    await trigger.click();
    await expect(dialog).not.toHaveAttribute('hidden', /.*/);

    const closeBtn = dialog.locator('[data-brut-close]').first();
    await closeBtn.click();
    await expect(dialog).toHaveAttribute('hidden', '');
  });

  test('Escape closes an open dialog', async ({ page }) => {
    const trigger = page.locator('[data-brut-open]').first();
    const dialogId = await trigger.getAttribute('data-brut-open');
    const dialog = page.locator(`#${dialogId}`);

    await trigger.click();
    await expect(dialog).not.toHaveAttribute('hidden', /.*/);

    await page.keyboard.press('Escape');
    await expect(dialog).toHaveAttribute('hidden', '');
  });

  test('clicking the scrim closes the dialog', async ({ page }) => {
    const trigger = page.locator('[data-brut-open]').first();
    const dialogId = await trigger.getAttribute('data-brut-open');
    const dialog = page.locator(`#${dialogId}`);
    const scrimId = await dialog.getAttribute('data-brut-scrim');
    if (!scrimId) test.skip(true, 'fixture has no scrim wired up');
    const scrim = page.locator(`#${scrimId}`);

    await trigger.click();
    await expect(scrim).not.toHaveAttribute('hidden', /.*/);

    await scrim.click({ position: { x: 5, y: 5 } });
    await expect(dialog).toHaveAttribute('hidden', '');
  });

  test('emits brut:open and brut:close', async ({ page }) => {
    const trigger = page.locator('[data-brut-open]').first();
    const dialogId = await trigger.getAttribute('data-brut-open');

    await page.evaluate((id) => {
      window.__events = [];
      const d = document.getElementById(id);
      d.addEventListener('brut:open',  () => window.__events.push('open'));
      d.addEventListener('brut:close', () => window.__events.push('close'));
    }, dialogId);

    await trigger.click();
    await page.keyboard.press('Escape');

    const events = await page.evaluate(() => window.__events);
    expect(events).toEqual(['open', 'close']);
  });
});
