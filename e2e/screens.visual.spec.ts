import { expect, test } from '@playwright/test';

/** Lundi 8 sept. 2026 — ancré sur les mocks WEEK_HISTORY (semaine ISO 37). */
const FIXED_NOW = new Date('2026-09-08T12:00:00');

async function openApp(page: import('@playwright/test').Page) {
  await page.clock.setFixedTime(FIXED_NOW);
  await page.goto('/');
  await expect(page.getByText('Bonjour,')).toBeVisible();
}

test.describe('Visual snapshots — main screens', () => {
  test('Accueil', async ({ page }) => {
    await openApp(page);
    await expect(page).toHaveScreenshot('home.png');
  });

  test('Programme', async ({ page }) => {
    await openApp(page);
    await page.getByRole('button', { name: 'Programme', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Programme' })).toBeVisible();
    await expect(page).toHaveScreenshot('programme.png');
  });

  test('Circuits', async ({ page }) => {
    await openApp(page);
    await page.getByRole('button', { name: 'Circuits' }).click();
    await expect(page.getByRole('heading', { name: 'Mes Circuits' })).toBeVisible();
    await expect(page).toHaveScreenshot('circuits.png');
  });

  test('Séance', async ({ page }) => {
    await openApp(page);
    await page.getByRole('button', { name: 'Séance' }).click();
    await expect(page.getByText('Circuit du jour')).toBeVisible();
    await expect(page).toHaveScreenshot('seance.png');
  });

  test('Profil', async ({ page }) => {
    await openApp(page);
    await page.getByRole('button', { name: 'Profil' }).click();
    await expect(page.getByRole('heading', { name: 'Mon Profil' })).toBeVisible();
    await expect(page).toHaveScreenshot('profil.png');
  });
});
