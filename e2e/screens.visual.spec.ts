import { expect, test } from '@playwright/test';

/** Lundi 8 sept. 2026 — ancré sur les mocks WEEK_HISTORY (semaine ISO 37). */
const FIXED_NOW = new Date('2026-09-08T12:00:00');

async function openApp(page: import('@playwright/test').Page) {
  await page.clock.install({ time: FIXED_NOW });
  await page.goto('/');
  await expect(page.getByText('Bonjour,')).toBeVisible();
}

async function openProgramme(page: import('@playwright/test').Page) {
  await openApp(page);
  await page.getByRole('button', { name: 'Programme', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Programme' })).toBeVisible();
}

async function openProgrammeWeek(page: import('@playwright/test').Page) {
  await openProgramme(page);
  await page.getByRole('button', { name: 'Semaine' }).click();
  await expect(page.getByRole('button', { name: 'Semaine suivante' })).toBeVisible();
}

test.describe('Visual snapshots — main screens', () => {
  test('Accueil', async ({ page }) => {
    await openApp(page);
    await expect(page).toHaveScreenshot('home.png');
  });

  test('Programme', async ({ page }) => {
    await openProgramme(page);
    await expect(page).toHaveScreenshot('programme.png');
  });

  test('Programme — assignation aujourd’hui', async ({ page }) => {
    await openProgrammeWeek(page);
    await page.getByText('LUN', { exact: true }).click();
    await expect(page.getByRole('button', { name: 'Repos' })).toBeVisible();
    await expect(page).toHaveScreenshot('programme-assign-today.png');
  });

  test('Programme — assignation futur', async ({ page }) => {
    await openProgrammeWeek(page);
    await page.getByRole('button', { name: 'Semaine suivante' }).click();
    await expect(page.getByText('Repos').first()).toBeVisible();
    await page.getByText('LUN', { exact: true }).click();
    await expect(page.getByRole('button', { name: 'Repos' })).toBeVisible();
    await expect(page).toHaveScreenshot('programme-assign-future.png');
  });

  test('Programme — confirmation passé', async ({ page }) => {
    await openProgrammeWeek(page);
    await page.getByRole('button', { name: 'Semaine précédente' }).click();
    await page.locator('p.truncate', { hasText: 'Push Day' }).first().click();
    await expect(page.getByRole('button', { name: 'Repos' })).toBeVisible();
    await page.getByRole('button', { name: 'Repos' }).click();
    await expect(page.getByText('Confirmer la modification')).toBeVisible();
    await expect(page).toHaveScreenshot('programme-assign-past-confirm.png');
  });

  test('Programme — vue mois', async ({ page }) => {
    await openProgramme(page);
    await expect(page.getByText('Séances')).toBeVisible();
    await expect(page).toHaveScreenshot('programme-month.png');
  });

  test('Programme — semaine depuis le mois', async ({ page }) => {
    await openProgramme(page);
    await page.getByRole('button', { name: '08' }).first().click();
    await expect(page.getByRole('button', { name: 'Semaine suivante' })).toBeVisible();
    await expect(page.getByText('LUN', { exact: true })).toBeVisible();
    await expect(page).toHaveScreenshot('programme-month-to-week.png');
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
