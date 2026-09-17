const { chromium } = require('playwright');

(async () => {
  const marks = [250, 600, 900, 1200, 1500, 1800, 2100, 2400, 3000];
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Enter Planet Owl' }).click();
  await page.waitForTimeout(2500);
  await page.evaluate(() => document.querySelector('#nest-view').scrollIntoView({ block: 'start' }));
  await page.waitForTimeout(1200);
  await page.getByRole('button', { name: 'Fly through the opening to Top Secrets' }).click();

  let elapsed = 0;
  for (const target of marks) {
    const wait = Math.max(0, target - elapsed);
    if (wait) await page.waitForTimeout(wait);
    elapsed = target;
    const state = await page.evaluate(() => {
      const imgs = [...document.querySelectorAll('img')].map((img) => ({
        src: img.src,
        opacity: getComputedStyle(img).opacity,
        transform: getComputedStyle(img).transform,
        rect: img.getBoundingClientRect().toJSON(),
      }));
      return {
        scrollY: window.scrollY,
        topSecrets: !!document.querySelector('#top-secrets'),
        matches: imgs.filter((i) => i.src.includes('nest-dive-city') || i.src.includes('Secrets-') || i.src.includes('nest-dive-secrets') || i.src.includes('top-secrets-heading') || i.src.includes('nest-owl')),
      };
    });
    console.log('MARK', target, JSON.stringify(state, null, 2));
  }

  await browser.close();
})();
