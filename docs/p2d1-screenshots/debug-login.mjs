export default async function (page, ui) {
  const pass = process.env.SEED_DEV_PASSWORD || 'DevPass123!';
  await page.goto('http://127.0.0.1:3000/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const labels = await page.locator('label').allTextContents();
  const inputs = await page.locator('input').evaluateAll((els) =>
    els.map((e) => ({ type: e.type, name: e.name, id: e.id, placeholder: e.placeholder }))
  );

  // Try fill by placeholder / name
  const user = page.locator('input').first();
  const pwd = page.locator('input[type="password"]');
  await user.fill('admin_a');
  await pwd.fill(pass);
  await page.getByRole('button', { name: /iniciar sesión/i }).click();
  await page.waitForTimeout(3000);
  const afterLogin = { url: page.url(), title: await page.title() };
  const storage = await page.evaluate(() => ({
    keys: Object.keys(localStorage),
    token: localStorage.getItem('token') || localStorage.getItem('accessToken') || localStorage.getItem('authToken'),
    user: localStorage.getItem('user'),
  }));

  await page.goto('http://127.0.0.1:3000/productos', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  await page.screenshot({
    path: 'c:/Proyectos/supertiendaweb/docs/p2d1-screenshots/02-catalog-attempt.png',
    fullPage: true,
  });
  const body = await page.locator('body').innerText();
  const testids = await page.locator('[data-testid]').evaluateAll((els) =>
    els.map((e) => e.getAttribute('data-testid'))
  );
  const err = await page.locator('nextjs-portal, [data-nextjs-dialog]').count().catch(() => 0);

  return { labels, inputs, afterLogin, storage, testids, bodySnippet: body.slice(0, 800), err };
}
