import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate to login page', async ({ page }) => {
    await page.click('text=Login');
    await expect(page).toHaveURL('/login');
    await expect(page.locator('h1')).toContainText('Sign In');
  });

  test('should navigate to register page', async ({ page }) => {
    await page.click('text=Get Started');
    await expect(page).toHaveURL('/register');
    await expect(page.locator('h1')).toContainText('Create Account');
  });

  test('should navigate to features page', async ({ page }) => {
    await page.click('text=Features');
    await expect(page).toHaveURL('/features');
  });

  test('should navigate to pricing page', async ({ page }) => {
    await page.click('text=Pricing');
    await expect(page).toHaveURL('/pricing');
  });
});

test.describe('Protected Routes', () => {
  test('should redirect to login for protected routes', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login');
  });

  test('should redirect to login for import statement', async ({ page }) => {
    await page.goto('/import-statement');
    await expect(page).toHaveURL('/login');
  });

  test('should redirect to login for financial analysis', async ({ page }) => {
    await page.goto('/financial-analysis');
    await expect(page).toHaveURL('/login');
  });
});