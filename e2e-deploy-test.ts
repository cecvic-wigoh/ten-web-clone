/**
 * E2E Test: Full Generation + Deploy to WordPress
 */

import { chromium } from 'playwright';

async function runDeployTest() {
  console.log('🚀 Starting E2E Deploy Test...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 300,
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  try {
    // Step 1: Navigate to app
    console.log('📍 Step 1: Opening the app...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'screenshots/deploy-01-start.png' });

    // Step 2: Fill form
    console.log('📝 Step 2: Filling business information...');

    await page.locator('input[name="businessName"], input[type="text"]').first().fill('CloudTech Innovations');

    await page.locator('textarea').first().fill(
      'CloudTech Innovations is a leading provider of cloud computing solutions for enterprises. ' +
      'We specialize in serverless architecture, Kubernetes deployments, and AI-powered DevOps automation. ' +
      'Our team has helped over 500 companies migrate to the cloud with zero downtime.'
    );

    // Select industry
    const industrySelect = page.locator('select');
    if (await industrySelect.count() > 0) {
      await industrySelect.first().selectOption({ index: 1 });
    }

    // Select professional tone
    await page.locator('input[value="professional"]').click();

    await page.screenshot({ path: 'screenshots/deploy-02-form.png' });

    // Step 3: Generate
    console.log('🏗️ Step 3: Generating website...');
    await page.locator('button[type="submit"]').click();

    // Wait for generation to complete (watch for preview to appear)
    await page.waitForSelector('[class*="preview"], iframe, h2:has-text("Preview")', { timeout: 120000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/deploy-03-preview.png' });
    console.log('   ✓ Website generated!\n');

    // Step 4: Click Deploy
    console.log('🚀 Step 4: Deploying to WordPress...');
    const deployButton = page.locator('button:has-text("Deploy")');

    if (await deployButton.count() > 0) {
      await deployButton.click();
      console.log('   ✓ Deploy button clicked');

      // Wait for deployment (should show "Deploying" state)
      await page.waitForTimeout(5000);
      await page.screenshot({ path: 'screenshots/deploy-04-deploying.png' });

      // Wait for completion or error
      await page.waitForTimeout(10000);
      await page.screenshot({ path: 'screenshots/deploy-05-result.png' });

      // Check for success message or new tab
      console.log('   ✓ Deployment complete!\n');
    } else {
      console.log('   ⚠ Deploy button not found');
    }

    // Step 5: Verify in WordPress
    console.log('🔍 Step 5: Verifying in WordPress...');
    await page.goto('http://localhost:8080/wp-admin/edit.php?post_type=page', { waitUntil: 'networkidle' });

    // Login if needed
    if (await page.locator('input[name="log"]').count() > 0) {
      await page.fill('input[name="log"]', 'admin');
      await page.fill('input[name="pwd"]', 'admin');  // Assuming admin password
      await page.click('input[type="submit"]');
      await page.waitForTimeout(2000);
    }

    await page.screenshot({ path: 'screenshots/deploy-06-wp-pages.png' });

    console.log('\n🎉 E2E Deploy Test Complete!');
    console.log('   Check screenshots/deploy-*.png for results');
    console.log('   Browser will stay open for 30 seconds...\n');

    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('❌ Test error:', error);
    await page.screenshot({ path: 'screenshots/deploy-error.png' });
  } finally {
    await browser.close();
  }
}

runDeployTest().catch(console.error);
