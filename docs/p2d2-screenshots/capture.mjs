const BASE = 'http://127.0.0.1:3000';
const API = 'http://127.0.0.1:5000';
const PASS = process.env.SEED_DEV_PASSWORD || 'DevPass123!';

async function apiLogin(username) {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password: PASS }),
  });
  const json = await res.json();
  if (!json?.success || !json?.data?.token) throw new Error('login failed');
  return json.data;
}

async function seedSession(page, username) {
  const data = await apiLogin(username);
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(
    ({ token, refreshToken, businessId }) => {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('token', token);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('businessId', String(businessId));
      localStorage.setItem('supertienda_access_exp', String(Date.now() + 3_600_000));
      localStorage.setItem('supertienda_refresh_exp', String(Date.now() + 86_400_000));
      document.cookie = `auth_token=${token}; path=/; max-age=86400; SameSite=Lax`;
    },
    {
      token: data.token,
      refreshToken: data.refreshToken,
      businessId: data.user?.employee?.businessId ?? 1,
    }
  );
}

export default async function (page) {
  await seedSession(page, 'admin_a');
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(`${BASE}/inventario`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-testid="commercial-inventory-page"]', { timeout: 60000 });
  await page.waitForTimeout(4000);
  await page.screenshot({
    path: 'c:/Proyectos/supertiendaweb/docs/p2d2-screenshots/01-inventory-desktop.png',
    fullPage: true,
  });

  const adjust = page.getByRole('button', { name: /^ajustar$/i }).first();
  if (await adjust.isVisible().catch(() => false)) {
    await adjust.click();
    await page.waitForTimeout(400);
    await page.screenshot({
      path: 'c:/Proyectos/supertiendaweb/docs/p2d2-screenshots/02-stock-adjust-dialog.png',
      fullPage: true,
    });
    await page.getByRole('button', { name: /cancelar/i }).click().catch(() => {});
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: 'c:/Proyectos/supertiendaweb/docs/p2d2-screenshots/03-inventory-mobile.png',
    fullPage: true,
  });

  const menuBtn = page.getByTestId('mobile-menu-button');
  await menuBtn.click();
  await page.waitForTimeout(400);
  await page.screenshot({
    path: 'c:/Proyectos/supertiendaweb/docs/p2d2-screenshots/04-mobile-menu.png',
    fullPage: true,
  });

  // navigate via drawer (scope to mobile nav)
  await page.locator('#mobile-nav').getByRole('link', { name: 'Catálogo' }).click();
  await page.waitForSelector('[data-testid="commercial-catalog-page"]', { timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: 'c:/Proyectos/supertiendaweb/docs/p2d2-screenshots/05-catalog-mobile-shell.png',
    fullPage: true,
  });

  const body = await page.locator('[data-testid="commercial-catalog-page"]').innerText();
  return { ok: true, snippet: body.slice(0, 200) };
}
