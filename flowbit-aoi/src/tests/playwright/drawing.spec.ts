import { test, expect } from "@playwright/test";

test("draw a polygon and persists to localStorage", async ({ page }) => {
  await page.goto("http://localhost:5173");
  // This test assumes a draw button exists and clicking it triggers a stored AOI
  await page.click("button#start-draw"); // add such a button in UI
  // simulate clicks on map to draw polygon (rough coordinates)
  await page.mouse.click(400, 300);
  await page.mouse.click(450, 350);
  await page.mouse.click(420, 400);
  await page.mouse.click(400, 300); // close
  // Save finished
  const stored = await page.evaluate(() => localStorage.getItem("flowbit_aoi_v1"));
  expect(stored).not.toBeNull();
  const parsed = JSON.parse(stored || "[]");
  expect(parsed.length).toBeGreaterThan(0);
});
