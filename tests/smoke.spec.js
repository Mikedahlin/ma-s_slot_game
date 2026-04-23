import { test, expect } from "@playwright/test";

test("loads slot game shell", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Lynne's AI Slot Deluxe/i);
  await expect(page.getByRole("button", { name: "Spin" })).toBeVisible();
  await expect(page.getByText("Payout Table")).toBeVisible();
});
