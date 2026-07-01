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
      // Replace these selectors with actual ones used in the app's login/signup page
      // Assuming a standard auth form
      await page.click('text=Sign Up');
      await page.fill('input[type="email"]', testEmail);
      await page.fill('input[type="password"]', testPassword);
      // Wait for username field if there's one, or maybe it's generated
      // await page.fill('input[name="username"]', testUsername);
      await page.click('button[type="submit"]');

      // Wait for dashboard to load
      await expect(page.locator('text=Dashboard').first()).toBeVisible({ timeout: 15000 });
      // Verify initial credits (assuming 1000 starter credits based on docs)
      await expect(page.locator('text=1000')).toBeVisible();
    });

    // 2. Mining (Harvest Loop)
    await test.step('Mining Action', async () => {
      // Navigate to mining/harvest section or click mining drill
      await page.click('text=Mine'); // Adjust selector
      await page.click('button:has-text("Start Job")');

      // Wait for the job to complete and claim
      await expect(page.locator('button:has-text("Claim")')).toBeVisible({ timeout: 30000 });
      await page.click('button:has-text("Claim")');

      // Verify inventory update
      await expect(page.locator('.inventory-item >> text=Ore')).toBeVisible();
    });

    // 3. Refining (Forge)
    await test.step('Refining Action', async () => {
      await page.click('text=Forge'); // Navigate to refining
      await page.click('button:has-text("Refine")');

      // Wait for completion
      await expect(page.locator('button:has-text("Collect")')).toBeVisible({ timeout: 30000 });
      await page.click('button:has-text("Collect")');

      // Verify inventory has refined material
      await expect(page.locator('.inventory-item >> text=Refined')).toBeVisible();
    });

    // 4. Market (Exchange)
    await test.step('Market Action (Sell and Buy)', async () => {
      await page.click('text=Market');
      
      // Sell
      await page.click('button:has-text("Create Listing")');
      await page.fill('input[name="price"]', '10');
      await page.fill('input[name="quantity"]', '1');
      await page.click('button:has-text("Confirm Sell")');

      // Buy a Drone
      await page.fill('input[type="search"]', 'Drone');
      await page.click('button:has-text("Buy")');
      
      // Verify Drone is in inventory
      await page.click('text=Inventory');
      await expect(page.locator('.inventory-item >> text=Drone')).toBeVisible();
    });

    // 5. Configure Swarm (Drone Command)
    await test.step('Swarm Configuration', async () => {
      await page.click('text=Command');
      await page.click('button:has-text("Edit Swarm")');
      
      // Assign Drone to a slot
      await page.click('.drone-slot');
      await page.click('text=Drone'); // select the drone
      await page.click('button:has-text("Save Configuration")');

      // Verify success
      await expect(page.locator('text=Swarm configured successfully')).toBeVisible();
    });
  });
});
