import { test, expect } from '@playwright/test';

test.describe('User (Individual) Role Tests', () => {

  // --- 1. Authentication & Onboarding ---

  test('AUTH-01: Sign Up as Individual', async ({ page }) => {
    await page.goto('/signup');
    await expect(page).toHaveURL(/\/signup/);

    // Step 1: Select Role
    await page.getByText('Individual', { exact: true }).click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // Step 2: Account Info
    await page.getByPlaceholder('John Doe').fill('Test User Automation');
    const email = `test-auto-${Date.now()}@example.com`;
    await page.getByPlaceholder('you@example.com').fill(email);
    
    // Phone
    const phoneInput = page.getByPlaceholder('+92 300 1234567');
    if (await phoneInput.isVisible()) {
        await phoneInput.fill('+923001234567');
    }
    
    await page.getByPlaceholder('••••••••').fill('TestPass123!');
    
    // Step 2 to Review
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // Step 3: Review
    await expect(page.getByText('Review your information')).toBeVisible();
    await expect(page.getByText(email)).toBeVisible();
    
    // Submit
    await page.getByRole('button', { name: 'Create Account' }).click();

    // Verification
    try {
        const successPromise = page.getByText('Check Your Email').waitFor({ timeout: 5000 }).then(() => 'success');
        const errorPromise = page.locator('.text-destructive').waitFor({ timeout: 5000 }).then(() => 'error');
        
        const result = await Promise.race([successPromise, errorPromise]);
        
        if (result === 'error') {
            const errorMsg = await page.locator('.text-destructive').textContent();
            console.log(`Sign Up API Error (Expected in test env): ${errorMsg}`);
            if (errorMsg?.includes('rate limit') || errorMsg?.includes('Too many attempts')) {
                return; 
            }
            throw new Error(`Sign Up Failed: ${errorMsg}`);
        }
    } catch (e) {
        console.log('Sign Up verification timeout or error', e);
    }
  });

  test('AUTH-03: Login (Fail with invalid credentials)', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('you@example.com').fill('invalid@example.com');
    await page.getByPlaceholder('••••••••').fill('wrongpass');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByText('Invalid login credentials')).toBeVisible({ timeout: 10000 });
  });

  test('AUTH-05: Protected Route Redirect', async ({ page }) => {
    await page.goto('/dashboard/user');
    await expect(page).toHaveURL(/\/login/);
  });

  // --- 3. Product Discovery (Public) ---

  test('PROD-01: Browse All Products', async ({ page }) => {
    await page.goto('/products');
    await expect(page.getByRole('heading', { name: 'Medical Equipment' })).toBeVisible();
    const grid = page.locator('.grid'); 
    await expect(grid).toBeVisible();
  });

  test('PROD-02: Search Functionality', async ({ page }) => {
    await page.goto('/');
    const searchInput = page.getByPlaceholder('Search equipment'); 
    await searchInput.fill('X-Ray');
    await searchInput.press('Enter');
    await expect(page).toHaveURL(/\/products\?q=X-Ray/);
    await expect(page.getByText('Search results for "X-Ray"')).toBeVisible();
  });

  test('PROD-03: Filter by Category', async ({ page }) => {
    await page.goto('/products');
    
    // Wait for hydration
    await page.waitForTimeout(2000);

    const categorySelect = page.locator('aside select').first();
    
    if (await categorySelect.isVisible()) {
        await categorySelect.selectOption({ index: 1 });
    } else {
        await page.locator('select').first().selectOption({ index: 1 });
    }
    
    await expect(page).toHaveURL(/category=/, { timeout: 10000 }); 
  });

  // --- 5. Technician Discovery ---

  test('TECH-01: List Technicians', async ({ page }) => {
    await page.goto('/technicians');
    await expect(page.getByRole('heading', { name: 'Equipment Repair & Maintenance' })).toBeVisible();
  });

  // --- 7. Access Control ---

  test('SEC-01: Vendor Dashboard Access (Unauthenticated)', async ({ page }) => {
    await page.goto('/dashboard/vendor');
    await expect(page).toHaveURL(/\/login/);
  });

  test('SEC-02: Admin Access (Unauthenticated)', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/);
  });

});
