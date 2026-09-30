import { expect, test } from '@playwright/test';

const screens = [
  { name: 'home', path: '/' },
  { name: 'programme', path: '/programme' },
  { name: 'circuits', path: '/circuits' },
  { name: 'seance', path: '/seance' },
  { name: 'profil', path: '/profil' },
  { name: 'circuits-nouveau', path: '/circuits/nouveau' },
];

for (const screen of screens) {
  test(`snapshot ${screen.name}`, async ({ page }) => {
    await page.goto(screen.path);
    const deviceFrame = page.getByTestId('device-frame');
    await expect(deviceFrame).toBeVisible();
    await expect(deviceFrame).toHaveScreenshot(`${screen.name}.png`);
  });
}
