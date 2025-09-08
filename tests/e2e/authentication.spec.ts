import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should display login form correctly', async ({ page }) => {
    await page.goto('/login');
    
    await expect(page.locator('h1')).toContainText('Sign In');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should display registration form correctly', async ({ page }) => {
    await page.goto('/register');
    
    await expect(page.locator('h1')).toContainText('Create Account');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should validate required fields on login', async ({ page }) => {
    await page.goto('/login');
    
    await page.click('button[type="submit"]');
    
    // Check for validation errors
    await expect(page.locator('text=Email is required')).toBeVisible();
  });

  test('should validate required fields on registration', async ({ page }) => {
    await page.goto('/register');
    
    await page.click('button[type="submit"]');
    
    // Check for validation errors
    await expect(page.locator('text=Email is required')).toBeVisible();
  });

  test('should navigate between login and register', async ({ page }) => {
    await page.goto('/login');
    
    await page.click('text=Create an account');
    await expect(page).toHaveURL('/register');
    
    await page.click('text=Sign in here');
    await expect(page).toHaveURL('/login');
  });
});