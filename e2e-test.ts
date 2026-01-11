/**
 * End-to-End Test for AI WordPress Builder
 *
 * Tests the full flow: prompt input -> generation -> preview
 */

import { chromium } from 'playwright';

async function runE2ETest() {
  console.log('🚀 Starting E2E test for AI WordPress Builder...\n');

  // Launch Chrome in headed mode so we can see it
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500, // Slow down actions so we can see what's happening
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });

  const page = await context.newPage();

  try {
    // Step 1: Navigate to the app
    console.log('📍 Step 1: Navigating to http://localhost:3001...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Take screenshot of initial state
    await page.screenshot({ path: 'screenshots/01-initial.png' });
    console.log('   ✓ Page loaded successfully\n');

    // Step 2: Fill in the form
    console.log('📝 Step 2: Filling in the business information...');

    // Business name
    const businessNameInput = page.locator('input[name="businessName"], input[placeholder*="business name" i], #businessName');
    if (await businessNameInput.count() > 0) {
      await businessNameInput.fill('TechFlow Solutions');
      console.log('   ✓ Business name entered');
    } else {
      console.log('   ⚠ Business name field not found, trying alternative selectors...');
      // Try to find any text input
      const inputs = page.locator('input[type="text"]');
      if (await inputs.count() > 0) {
        await inputs.first().fill('TechFlow Solutions');
        console.log('   ✓ Found and filled first text input');
      }
    }

    // Business description
    const descriptionInput = page.locator('textarea[name="description"], textarea[placeholder*="description" i], #description, textarea');
    if (await descriptionInput.count() > 0) {
      await descriptionInput.first().fill(
        'TechFlow Solutions is a cutting-edge software development company specializing in AI-powered automation tools. ' +
        'We help businesses streamline their operations with custom software solutions, cloud infrastructure, and data analytics. ' +
        'Our team of expert developers has delivered over 200 successful projects for Fortune 500 companies.'
      );
      console.log('   ✓ Business description entered');
    }

    // Industry selection (if exists)
    const industrySelect = page.locator('select[name="industry"], #industry');
    if (await industrySelect.count() > 0) {
      await industrySelect.selectOption({ index: 1 }); // Select first option after default
      console.log('   ✓ Industry selected');
    }

    // Tone selection (if radio buttons exist)
    const toneRadio = page.locator('input[name="tone"][value="professional"], input[type="radio"]');
    if (await toneRadio.count() > 0) {
      await toneRadio.first().click();
      console.log('   ✓ Tone selected');
    }

    await page.screenshot({ path: 'screenshots/02-form-filled.png' });
    console.log('');

    // Step 3: Submit the form
    console.log('🚀 Step 3: Submitting form to generate website...');
    const submitButton = page.locator('button[type="submit"], button:has-text("Generate"), button:has-text("Create"), button:has-text("Build")');

    if (await submitButton.count() > 0) {
      await submitButton.first().click();
      console.log('   ✓ Form submitted\n');

      // Step 4: Watch for generation progress
      console.log('⏳ Step 4: Watching generation progress...');

      // Wait for progress indicators or loading state
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'screenshots/03-generating.png' });

      // Wait for generation to complete (up to 3 minutes)
      let attempts = 0;
      const maxAttempts = 36; // 36 * 5 seconds = 3 minutes

      while (attempts < maxAttempts) {
        await page.waitForTimeout(5000);
        attempts++;

        // Check for completion indicators
        const preview = page.locator('[class*="preview"], iframe, [data-testid="preview"]');
        const success = page.locator(':has-text("complete"), :has-text("success"), :has-text("deployed")');
        const error = page.locator('[class*="error"], :has-text("Error"), :has-text("Failed")');

        if (await error.count() > 0) {
          console.log('   ❌ Error detected during generation');
          await page.screenshot({ path: 'screenshots/04-error.png' });
          break;
        }

        if (await preview.count() > 0 || await success.count() > 0) {
          console.log('   ✓ Generation appears complete!');
          await page.screenshot({ path: 'screenshots/04-complete.png' });
          break;
        }

        console.log(`   ... Still generating (${attempts * 5}s elapsed)`);
        await page.screenshot({ path: `screenshots/03-progress-${attempts}.png` });
      }

    } else {
      console.log('   ⚠ Submit button not found');
      // Log page content for debugging
      const html = await page.content();
      console.log('   Page structure:', html.substring(0, 500));
    }

    // Step 5: Final state
    console.log('\n📸 Step 5: Capturing final state...');
    await page.screenshot({ path: 'screenshots/05-final.png', fullPage: true });
    console.log('   ✓ Final screenshot saved\n');

    // Keep browser open for manual inspection
    console.log('🎉 E2E test complete! Browser will stay open for 30 seconds for inspection...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'screenshots/error.png' });
  } finally {
    await browser.close();
    console.log('\n👋 Browser closed. Check the screenshots/ folder for results.');
  }
}

// Create screenshots directory
import { mkdirSync } from 'fs';
try {
  mkdirSync('screenshots', { recursive: true });
} catch {}

// Run the test
runE2ETest().catch(console.error);
