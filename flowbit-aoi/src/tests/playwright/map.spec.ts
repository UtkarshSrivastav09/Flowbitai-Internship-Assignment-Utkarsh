import { test, expect } from "@playwright/test";

test("loads map page and shows map container", async ({ page }) => {
  await page.goto("http://localhost:5173"); // vite dev default
  await expect(page.locator(".leaflet-container")).toBeVisible();
  // check tile images or canvas presence - wait for at least one tile img
  await expect(page.locator("img[src*='tile']",{timeout:5000})).toHaveCountGreaterThan(0);
});
