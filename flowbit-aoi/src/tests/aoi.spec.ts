import { test, expect } from "@playwright/test";

test("draw a polygon and persists to localStorage", async ({ page }) => {
  await page.goto("http://localhost:5173");

  // Wait until map + controls load
  await page.waitForSelector("#start-draw");

  // Click the Start Draw button
  await page.click("#start-draw");

  await page.waitForTimeout(500); // drawing mode activate

  // Draw polygon points
  const points = [
    { x: 400, y: 300 },
    { x: 450, y: 350 },
    { x: 420, y: 400 },
    { x: 400, y: 300 }, // closing shape
  ];

  for (const p of points) {
    await page.mouse.click(p.x, p.y);
    await page.waitForTimeout(200);
  }

  // Wait for Leaflet to save AOI → localStorage
  await page.waitForTimeout(800);

  // Use window.localStorage to avoid TS warning
  const stored = await page.evaluate(() =>
    window.localStorage.getItem("flowbit_aoi_v1")
  );

  expect(stored).not.toBeNull();

  const parsed = JSON.parse(stored ?? "[]");

  expect(parsed.length).toBeGreaterThan(0);
});
