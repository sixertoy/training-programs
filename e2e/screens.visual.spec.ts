import { expect, test } from '@playwright/test';

/** Lundi 8 sept. 2026 — ancré sur les mocks WEEK_HISTORY (semaine ISO 37). */
const FIXED_NOW = new Date('2026-09-08T12:00:00');

async function openApp(page: import('@playwright/test').Page) {
  await page.clock.install({ time: FIXED_NOW });
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

  test('Programme — assignation jour', async ({ page }) => {
    await openApp(page);
    await page.getByRole('button', { name: 'Programme', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Programme' })).toBeVisible();
    // Aujourd'hui = Lundi (horloge figée) → Vendredi (Full Body) est assignable
    // p.truncate = ligne du programme (pas le h2 "Aujourd'hui")
    await page.locator('p.truncate', { hasText: 'Full Body' }).click();
    await expect(page.getByText('Vendredi')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Repos' })).toBeVisible();
    await expect(page).toHaveScreenshot('programme-assign-day.png');
  });

  test('Circuits', async ({ page }) => {
    await openApp(page);
    await page.getByRole('button', { name: 'Circuits' }).click();
    await expect(page.getByRole('heading', { name: 'Mes Circuits' })).toBeVisible();
    await expect(page).toHaveScreenshot('circuits.png');
  });

  test('Circuits — créer un circuit', async ({ page }) => {
    await openApp(page);
    await page.getByRole('button', { name: 'Circuits' }).click();
    await page.getByRole('button', { name: 'Créer un circuit' }).click();
    await expect(page.getByRole('heading', { name: 'Créer un Circuit' })).toBeVisible();
    await expect(page).toHaveScreenshot('circuits-create.png');
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
