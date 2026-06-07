import { chromium } from 'playwright';

async function verifyApp() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const port = 3001;
  console.log(`Testing XAU/USD Analyzer on port ${port}...`);

  try {
    await page.goto(`http://localhost:${port}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);

    // Check if React app rendered
    const bodyContent = await page.locator('body').innerHTML();
    
    if (bodyContent.length < 100) {
      console.log('ERROR: App did not render - body too small');
      console.log('Body length:', bodyContent.length);
      await browser.close();
      return false;
    }

    // Try to find elements
    const header = await page.locator('h1').count();
    const controls = await page.locator('.controls').count();
    const chart = await page.locator('.chart-container').count();
    
    console.log(`Found: h1=${header}, controls=${controls}, chart=${chart}`);
    
    if (header > 0) {
      const title = await page.locator('h1').textContent();
      console.log(`✓ Title: ${title}`);
    }

    // Take screenshot
    await page.screenshot({ path: 'test-screenshot.png' });
    console.log('✓ Screenshot taken');

    if (header > 0 && controls > 0 && chart > 0) {
      console.log('✓ SUCCESS: All main components found!');
      await browser.close();
      return true;
    } else {
      console.log('✗ PARTIAL: Some components missing');
      await browser.close();
      return false;
    }

  } catch (err) {
    console.error('✗ ERROR:', err.message);
    await browser.close();
    return false;
  }
}

verifyApp().then(success => process.exit(success ? 0 : 1));
