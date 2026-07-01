import { test, expect } from '@playwright/test';

test.describe('Zero to Hero Economic Loop', () => {
  const uniqueId = Date.now();
  const testEmail = `test_user_${uniqueId}@example.com`;
  const testPassword = 'Password123!';
  const testUsername = `user_${uniqueId}`;

  test('completes the full flow: Signup -> Mine -> Refine -> Market -> Swarm', async ({ page }) => {
    // 1. Account Creation (Signup)
    await test.step('Signup and Initial Load', async () => {
      await page.goto('/');
      
      // Click the "REGISTER" toggle link at the bottom
      await page.click('text=REGISTER');
      
      // Fill out the registration form
      await page.fill('input[type="email"]', testEmail);
      await page.fill('input[type="text"]', testUsername); // Callsign
      await page.fill('input[type="password"]', testPassword);
      
      // Submit registration
      await page.click('button[type="submit"]');

      // Wait for dashboard to load (OXYCORP BUNKER header should appear)
      await expect(page.locator('text=OXYCORP BUNKER').first()).toBeVisible({ timeout: 15000 });
      // Verify initial credits (starter credits = 1000)
      await expect(page.locator('text=CREDITS: ₡1,000')).toBeVisible();
    });

    // 2. Mining (Harvest Loop)
    await test.step('Mining Action', async () => {
      // Open Operations Command terminal
      await page.click('text=[ OPERATIONS COMMAND ]');

      // Click the first available RESOURCE sector on the map
      // (Sector title contains 'RESOURCE' in MapGrid)
      await page.locator('div[title*="RESOURCE"]').first().click();
      
      // Initiate extraction
      await page.click('button:has-text("INITIATE EXTRACTION")');

      // Wait for the job to complete and claim
      await expect(page.locator('button:has-text("COLLECT RESOURCES")')).toBeVisible({ timeout: 30000 });
      await page.click('button:has-text("COLLECT RESOURCES")');
      
      // Accept the success alert
      page.on('dialog', dialog => dialog.accept());
    });

    // 3. Refining (Forge)
    await test.step('Refining Action', async () => {
      // Refining is in the same terminal (Operations Command)
      await page.click('button:has-text("IGNITE FORGE")');

      // Wait for completion
      await expect(page.locator('button:has-text("COLLECT")').first()).toBeVisible({ timeout: 65000 }); // 60s craft time
      await page.click('button:has-text("COLLECT")');

      // Close the terminal
      await page.click('button:has-text("[X] DISCONNECT")');
    });

    // 4. Market (Exchange)
    await test.step('Market Action (Sell)', async () => {
      // Open Market terminal
      await page.click('text=[ LOGISTICS & TRADE ]');
      
      // Sell 1 quantity at 10 credits (default values might be pre-filled, so just click SELL)
      await page.fill('input[type="number"]').first().fill('1'); // Qty
      // The second number input is price
      await page.locator('input[type="number"]').nth(1).fill('10'); // Price

      await page.click('button:has-text("SELL")');
      
      // Close terminal
      await page.click('button:has-text("[X] DISCONNECT")');
    });

    // 5. Configure Swarm (Drone Command)
    await test.step('Swarm Configuration', async () => {
      await page.click('text=[ TACTICAL COMMAND ]');
      
      // Expect War Room UI to be visible
      await expect(page.locator('text=SWARM CONFIGURATION')).toBeVisible();
      
      // We will implement full drag-and-drop tests in a dedicated swarm.spec.ts
      await page.click('button:has-text("[X] DISCONNECT")');
    });
  });
});
