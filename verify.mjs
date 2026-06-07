import { chromium } from 'playwright';
import fs from 'fs';

async function verifyApp() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log('📱 Opening XAU/USD Analyzer at http://localhost:3002...');

  try {
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });

    // Wait a bit for React to render
    await page.waitForTimeout(2000);

    // Take initial screenshot
    await page.screenshot({ path: 'screenshot-1-initial.png' });
    console.log('✅ Page loaded successfully');

    // Verify header and price display
    const header = await page.locator('h1').textContent();
    console.log(`📊 Header: ${header}`);

    const price = await page.locator('.price').textContent();
    console.log(`💰 Current Price: ${price}`);

    // Verify chart container
    const chartContainer = await page.locator('.chart-container');
    const chartVisible = await chartContainer.isVisible();
    console.log(`📈 Chart Container Visible: ${chartVisible}`);

    // Verify indicators section
    const indicatorsContainer = await page.locator('.indicators-container');
    const indicatorsVisible = await indicatorsContainer.isVisible();
    console.log(`📊 Indicators Container Visible: ${indicatorsVisible}`);

    const smaValue = await page.locator('.indicators-grid').first().textContent();
    console.log(`📍 Indicators Found: ${smaValue ? 'YES' : 'NO'}`);

    // Verify prediction panel
    const predictionContainer = await page.locator('.prediction-container');
    const predictionVisible = await predictionContainer.isVisible();
    console.log(`🎯 Prediction Container Visible: ${predictionVisible}`);

    const trendText = await page.locator('.trend-text').textContent();
    console.log(`🔮 Trend Prediction: ${trendText}`);

    // Test timeframe buttons
    console.log('\n🔘 Testing Timeframe Buttons...');
    const buttons = await page.locator('.controls button');
    const buttonCount = await buttons.count();
    console.log(`✅ Found ${buttonCount} timeframe buttons`);

    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      await button.click();
      await page.waitForTimeout(500);
      console.log(`  ✅ Clicked ${text}`);
    }

    // Take final screenshot
    await page.screenshot({ path: 'screenshot-2-final.png' });

    console.log('\n✨ Verification Complete!');
    console.log('📸 Screenshots saved: screenshot-1-initial.png, screenshot-2-final.png');

    await browser.close();
    return true;

  } catch (error) {
    console.error('❌ Error:', error.message);
    await browser.close();
    return false;
  }
}

verifyApp().then(success => {
  process.exit(success ? 0 : 1);
});
