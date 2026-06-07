import { chromium } from 'playwright';

async function debugApp() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Capture console messages
  page.on('console', msg => console.log('BROWSER LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err));

  console.log('Opening app...');
  await page.goto('http://localhost:3002', { waitUntil: 'domcontentloaded' });
  
  // Wait for React to render
  await page.waitForTimeout(5000);

  // Check the root div
  const rootContent = await page.locator('#root').innerHTML();
  console.log('Root div content length:', rootContent.length);
  console.log('First 500 chars:', rootContent.substring(0, 500));

  // Check if app div exists
  const appDiv = await page.locator('.app').count();
  console.log('Found .app divs:', appDiv);

  // Try to wait for the app to load
  try {
    await page.locator('.app').waitFor({ timeout: 5000 });
    console.log('App element found!');
  } catch (e) {
    console.log('App element not found:', e.message);
  }

  await browser.close();
}

debugApp().catch(console.error);
