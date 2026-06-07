import { chromium } from 'playwright';

async function debugApp() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log('Opening app...');
  await page.goto('http://localhost:3002', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // Take screenshot
  await page.screenshot({ path: '/c/Users/iqbal/xauusd-analyzer/debug-screenshot.png' });
  console.log('Screenshot taken');

  // Check for h1
  const h1Count = await page.locator('h1').count();
  console.log(`Found ${h1Count} h1 elements`);

  // Check for any headers
  const headers = await page.locator('header').count();
  console.log(`Found ${headers} header elements`);

  // Get body text
  const bodyText = await page.locator('body').textContent();
  console.log('\nBody text (first 300 chars):');
  console.log(bodyText.substring(0, 300));

  // Check for errors in console
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err));

  await browser.close();
}

debugApp().catch(console.error);
