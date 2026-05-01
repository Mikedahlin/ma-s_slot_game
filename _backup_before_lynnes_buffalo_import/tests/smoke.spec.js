import { test, expect } from "@playwright/test";

test("loads slot game shell", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Slots/i);
  await expect(page.getByRole("button", { name: "Spin" })).toBeVisible();
  await expect(page.getByText("Payout Table")).toBeVisible();
});

test("spin flow runs without runtime errors", async ({ page }) => {
  const pageErrors = [];
  page.on("pageerror", (error) => {
    pageErrors.push(String(error.message || error));
  });

  await page.goto("/");
  const spinButton = page.getByRole("button", { name: "Spin" });
  await spinButton.click();

  await expect(page.locator("#slotMessage")).toContainText(/spinning|win|bonus|jackpot|no line win/i);
  expect(pageErrors).toEqual([]);
});
