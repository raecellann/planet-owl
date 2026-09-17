const { chromium } = require('playwright');

(async () => {
  const shots = [
    ['01-owl-fly', 250],
    ['02-zoom-city', 950],
    ['03-splash', 1550],
    ['04-secrets-handoff', 2150],
    ['05-landed', 2850],
  ];

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(String(err)));

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Enter Planet Owl' }).click();
  await page.waitForTimeout(2500);
  await page.evaluate(() => document.querySelector('#nest-view').scrollIntoView({ block: 'start' }));
  await page.waitForTimeout(1200);
  await page.getByRole('button', { name: 'Fly through the opening to Top Secrets' }).click();

  let elapsed = 0;
  for (const [name, target] of shots) {
    const wait = Math.max(0, target - elapsed);
    if (wait) await page.waitForTimeout(wait);
    elapsed = target;
    await page.screenshot({ path: `C:/Users/heart/AppData/Local/Temp/${name}.png` });
  }

  console.log(JSON.stringify({ errors, finalUrl: page.url() }, null, 2));
  await browser.close();
})();
