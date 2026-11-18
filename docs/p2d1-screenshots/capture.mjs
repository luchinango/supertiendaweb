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
  if (!json?.success || !json?.data?.token) {
    throw new Error(`login failed for ${username}: ${JSON.stringify(json).slice(0, 200)}`);
  }
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
      if (businessId != null) localStorage.setItem('businessId', String(businessId));
      localStorage.setItem('supertienda_access_exp', String(Date.now() + 3_600_000));
      localStorage.setItem('supertienda_refresh_exp', String(Date.now() + 86_400_000));
      document.cookie = `auth_token=${token}; path=/; max-age=86400; SameSite=Lax`;
    },
    {
      token: data.token,
      refreshToken: data.refreshToken,
      businessId: data.user?.employee?.businessId ?? data.user?.businessId ?? 1,
    }
  );
  return data.user;
}

export default async function (page) {
  await page.setViewportSize({ width: 1280, height: 800 });
  const adminUser = await seedSession(page, 'admin_a');
  await page.goto(`${BASE}/productos`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-testid="commercial-catalog-page"]', { timeout: 60000 });
  await page.waitForTimeout(4500);
  await page.screenshot({
    path: 'c:/Proyectos/supertiendaweb/docs/p2d1-screenshots/02-catalog-desktop.png',
    fullPage: true,
  });

  const body = await page.locator('[data-testid="commercial-catalog-page"]').innerText();

  await page.setViewportSize({ width: 768, height: 1024 });
  await page.waitForTimeout(400);
  await page.screenshot({
    path: 'c:/Proyectos/supertiendaweb/docs/p2d1-screenshots/03-catalog-tablet.png',
    fullPage: true,
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(400);
  await page.screenshot({
    path: 'c:/Proyectos/supertiendaweb/docs/p2d1-screenshots/04-catalog-mobile.png',
    fullPage: true,
  });

  if (await page.getByRole('button', { name: /nuevo producto/i }).isVisible().catch(() => false)) {
    await page.getByRole('button', { name: /nuevo producto/i }).click();
    await page.waitForTimeout(500);
    await page.screenshot({
      path: 'c:/Proyectos/supertiendaweb/docs/p2d1-screenshots/05-create-dialog-mobile.png',
      fullPage: true,
    });
    await page.getByRole('button', { name: /cancelar/i }).click().catch(() => {});
  }

  await page.setViewportSize({ width: 1280, height: 800 });
  if (await page.getByRole('button', { name: /cola|conflictos/i }).isVisible().catch(() => false)) {
    await page.getByRole('button', { name: /cola|conflictos/i }).click();
    await page.waitForTimeout(700);
    await page.screenshot({
      path: 'c:/Proyectos/supertiendaweb/docs/p2d1-screenshots/06-outbox-panel.png',
      fullPage: true,
    });
  }

  await seedSession(page, 'employee_a');
  await page.goto(`${BASE}/productos`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-testid="commercial-catalog-page"]', { timeout: 60000 });
  await page.waitForTimeout(3500);
  await page.screenshot({
    path: 'c:/Proyectos/supertiendaweb/docs/p2d1-screenshots/07-catalog-employee.png',
    fullPage: true,
  });

  return {
    ok: true,
    adminRole: adminUser?.role,
    bodySnippet: body.slice(0, 700),
  };
}
