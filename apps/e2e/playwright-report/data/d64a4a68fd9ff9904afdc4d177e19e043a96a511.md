# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: zero-to-hero.spec.ts >> Zero to Hero Economic Loop >> completes the full flow: Signup -> Mine -> Refine -> Market -> Swarm
- Location: tests\zero-to-hero.spec.ts:9:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=> STATUS: OWNED')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('text=> STATUS: OWNED')

```

```yaml
- text: "[ COMMS-LINK ]"
- heading "OXYCORP BUNKER" [level=1]
- text: "OPERATOR: user_1782948025902 [CREDITS: ₡1,000] [BUNKER LVL ]"
- button "[ NEURAL CONDITIONING ] Skills & Development"
- button "[ OPERATIONS COMMAND ] Mining, Refining, Map"
- button "[ COMMUNICATIONS ] Directives & Chat"
- button "[ INFRASTRUCTURE ] Facilities Management"
- button "[ LOGISTICS & TRADE ] Market Operations"
- button "[ TACTICAL COMMAND ] Combat Systems"
- button "LOGOUT"
- dialog "Terminal Interface":
  - text: "[ OPERATIONS COMMAND ]"
  - button "[X] DISCONNECT"
  - text: "[ RESOURCE OPS ] ONLINE > SECTOR LOCKED Owner ID Mismatch You do not have mining rights. Sector Owner: ... Your ID: a3318221... [ THE FORGE ] ONLINE > Heating up... [ TACTICAL MAP ] CENTER: [0, 0]"
  - button "N"
  - button "W"
  - button "HQ"
  - button "E"
  - button "S"
  - text: "▪ + ■ BUNKER ■ RESOURCE ■ EMPTY □ OWNED [ SECTOR INTEL ] WARNING COORDINATES [5, 4] TYPE RESOURCE STATUS UNCLAIMED RESOURCE [COPPER: 131%] EXPANSION STATUS [TERRITORIES: 3/3]"
  - button "[>>> CLAIM SECTOR [500 CR] <<<]"
  - text: "SYS://TERMINAL/CONTROL_CENTER SIGNAL: ACTIVE"
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Zero to Hero Economic Loop', () => {
  4   |   const uniqueId = Date.now();
  5   |   const testEmail = `test_user_${uniqueId}@example.com`;
  6   |   const testPassword = 'Password123!';
  7   |   const testUsername = `user_${uniqueId}`;
  8   | 
  9   |   test('completes the full flow: Signup -> Mine -> Refine -> Market -> Swarm', async ({ page }) => {
  10  |     // 1. Account Creation (Signup)
  11  |     await test.step('Signup and Initial Load', async () => {
  12  |       await page.goto('/');
  13  |       
  14  |       // Click the "REGISTER" toggle link at the bottom
  15  |       await page.click('text=REGISTER');
  16  |       
  17  |       // Fill out the registration form
  18  |       await page.fill('input[type="email"]', testEmail);
  19  |       await page.fill('input[type="text"]', testUsername); // Callsign
  20  |       await page.fill('input[type="password"]', testPassword);
  21  |       
  22  |       // Submit registration
  23  |       await page.click('button[type="submit"]');
  24  | 
  25  |       // Wait for dashboard to load (OXYCORP BUNKER header should appear)
  26  |       await expect(page.locator('text=OXYCORP BUNKER').first()).toBeVisible({ timeout: 15000 });
  27  |       // Verify initial credits (starter credits = 1000)
  28  |       await expect(page.locator('text=CREDITS: ₡1,000')).toBeVisible();
  29  |     });
  30  | 
  31  |     // 2. Mining (Harvest Loop)
  32  |     await test.step('Mining Action', async () => {
  33  |       // Open Operations Command terminal
  34  |       await page.click('text=[ OPERATIONS COMMAND ]');
  35  | 
  36  |       // Wait for terminal to load and either show EXPAND or existing resources
  37  |       await expect(
  38  |         page.locator('button:has-text("EXPAND TERRITORY"), div[title*="RESOURCE"]').first()
  39  |       ).toBeVisible({ timeout: 15000 });
  40  | 
  41  |       // Generate territory if needed
  42  |       const expandBtn = page.locator('button:has-text("EXPAND TERRITORY")');
  43  |       if (await expandBtn.isVisible()) {
  44  |         // Handle alert and wait for API to finish
  45  |         page.on('dialog', dialog => dialog.accept());
  46  |         const resPromise = page.waitForResponse(res => res.url().includes('/map/generate-territory'));
  47  |         await expandBtn.click();
  48  |         await resPromise;
  49  |       }
  50  | 
  51  |       // Click the first available RESOURCE sector on the map
  52  |       // (Sector title contains 'RESOURCE' in MapGrid)
  53  |       await page.locator('div[title*="RESOURCE"]').first().click();
  54  | 
  55  |       // Claim the sector
  56  |       await page.click('button:has-text("CLAIM SECTOR [500 CR]")');
  57  |       
  58  |       // Claiming unselects the sector, so re-click it after map refreshes
  59  |       await page.waitForResponse(res => res.url().includes('/map/sectors'));
  60  |       await page.locator('div[title*="RESOURCE"]').first().click();
  61  | 
  62  |       // Wait for it to become owned (button disappears or text changes)
> 63  |       await expect(page.locator('text=> STATUS: OWNED')).toBeVisible({ timeout: 10000 });
      |                                                          ^ Error: expect(locator).toBeVisible() failed
  64  |       
  65  |       // Initiate extraction
  66  |       await page.click('button:has-text("INITIATE EXTRACTION")');
  67  | 
  68  |       // Wait for extraction to complete
  69  |       await expect(page.locator('button:has-text("COLLECT RESOURCES")')).toBeVisible({ timeout: 30000 });
  70  |       
  71  |       // Accept the success alert
  72  |       page.once('dialog', dialog => dialog.accept());
  73  |       await page.click('button:has-text("COLLECT RESOURCES")');
  74  |     });
  75  | 
  76  |     // 3. Refining (Forge)
  77  |     await test.step('Refining Action', async () => {
  78  |       // Refining is in the same terminal (Operations Command)
  79  |       await page.click('button:has-text("IGNITE FORGE")');
  80  | 
  81  |       // Wait for completion
  82  |       await expect(page.locator('button:has-text("COLLECT")').first()).toBeVisible({ timeout: 65000 }); // 60s craft time
  83  |       await page.click('button:has-text("COLLECT")');
  84  | 
  85  |       // Close the terminal
  86  |       await page.click('button:has-text("[X] DISCONNECT")');
  87  |     });
  88  | 
  89  |     // 4. Market (Exchange)
  90  |     await test.step('Market Action (Sell)', async () => {
  91  |       // Open Market terminal
  92  |       await page.click('text=[ LOGISTICS & TRADE ]');
  93  |       
  94  |       // Sell 1 quantity at 10 credits (default values might be pre-filled, so just click SELL)
  95  |       await page.fill('input[type="number"]').first().fill('1'); // Qty
  96  |       // The second number input is price
  97  |       await page.locator('input[type="number"]').nth(1).fill('10'); // Price
  98  | 
  99  |       await page.click('button:has-text("SELL")');
  100 |       
  101 |       // Close terminal
  102 |       await page.click('button:has-text("[X] DISCONNECT")');
  103 |     });
  104 | 
  105 |     // 5. Configure Swarm (Drone Command)
  106 |     await test.step('Swarm Configuration', async () => {
  107 |       await page.click('text=[ TACTICAL COMMAND ]');
  108 |       
  109 |       // Expect War Room UI to be visible
  110 |       await expect(page.locator('text=SWARM CONFIGURATION')).toBeVisible();
  111 |       
  112 |       // We will implement full drag-and-drop tests in a dedicated swarm.spec.ts
  113 |       await page.click('button:has-text("[X] DISCONNECT")');
  114 |     });
  115 |   });
  116 | });
  117 | 
```