const BASE = 'http://127.0.0.1:3000';
const API = 'http://127.0.0.1:5000';
const PASS = process.env.SEED_DEV_PASSWORD || 'DevPass123!';

export default async function (page) {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin_a', password: PASS }),
  });
  const json = await res.json();
  const token = json.data.token;
  const refreshToken = json.data.refreshToken;

  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(
    ({ token, refreshToken }) => {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('token', token);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('businessId', '1');
      localStorage.setItem('supertienda_access_exp', String(Date.now() + 3600000));
      localStorage.setItem('supertienda_refresh_exp', String(Date.now() + 86400000));
    },
    { token, refreshToken }
  );

  // probe verify via browser (same origin proxy)
  const verifyViaProxy = await page.evaluate(async (tok) => {
    try {
      const r = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
        body: '{}',
      });
      const text = await r.text();
      return { status: r.status, text: text.slice(0, 500) };
    } catch (e) {
      return { error: String(e) };
    }
  }, token);

  await page.goto(`${BASE}/productos`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  await page.screenshot({
    path: 'c:/Proyectos/supertiendaweb/docs/p2d1-screenshots/02-catalog-desktop.png',
    fullPage: true,
  });

  return {
    verifyViaProxy,
    url: page.url(),
    body: (await page.locator('body').innerText()).slice(0, 900),
    testids: await page.locator('[data-testid]').evaluateAll((els) =>
      els.map((e) => e.getAttribute('data-testid'))
    ),
    storageKeys: await page.evaluate(() => Object.keys(localStorage)),
  };
}
