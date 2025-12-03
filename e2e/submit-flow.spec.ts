import { test, expect } from '@playwright/test'

test.describe('Submission Flow', () => {
  test('should display submission form', async ({ page }) => {
    await page.goto('/submit')
    await expect(page.locator('h1')).toContainText('Submit Your AI Tool')
    await expect(page.locator('input[name="toolData.name"]')).toBeVisible()
  })

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/submit')
    await page.click('button[type="submit"]')
    // Wait for validation errors
    await expect(page.locator('text=/required/i').first()).toBeVisible()
  })
})

test.describe('Tools Directory', () => {
  test('should display tools listing', async ({ page }) => {
    await page.goto('/tools')
    await expect(page.locator('h1')).toContainText('AI Tools Directory')
  })

  test('should allow searching tools', async ({ page }) => {
    await page.goto('/tools')
    await page.fill('input[name="q"]', 'test')
    await page.click('button[type="submit"]')
    // Should navigate or show results
    await expect(page).toHaveURL(/.*q=test.*/)
  })
})

