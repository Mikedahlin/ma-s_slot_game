import { test, expect } from "@playwright/test";

async function closeCompletedBonus(page, timeout = 8000) {
  const continueButton = page.getByRole("button", { name: "Continue" });
  await expect(continueButton).toBeVisible({ timeout });
  await continueButton.click();
  await expect(page.locator("#bonusOverlay")).toHaveAttribute("aria-hidden", "true");
}

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

test("all permanent controls work", async ({ page }) => {
  await page.goto("/");

  const bet = page.locator("#betValue");
  await expect(bet).toHaveText("$2,500");
  await page.getByRole("button", { name: "Bet +" }).click();
  await expect(bet).toHaveText("$5,000");
  await page.getByRole("button", { name: "Bet -" }).click();
  await expect(bet).toHaveText("$2,500");

  const soundButton = page.getByRole("button", { name: "Sound: On" });
  await soundButton.click();
  await expect(page.getByRole("button", { name: "Sound: Off" })).toHaveAttribute("aria-pressed", "true");

  const volume = page.getByRole("slider", { name: "Volume" });
  await volume.fill("35");
  await expect(volume).toHaveValue("35");

  await page.getByRole("combobox", { name: "Game" }).selectOption("1");
  await expect(page.locator("#themeTitle")).toHaveText("Velvet Gold Palace");
  await expect(page.locator("#slotMessage")).toContainText("Loaded Velvet Gold Palace");
});

test("wheel bonus button accepts a normal pointer click", async ({ page }) => {
  await page.goto("/");
  await page.evaluate("launchWheelBonus()");

  const wheelButton = page.getByRole("button", { name: "SPIN WHEEL" });
  await expect(wheelButton).toBeVisible();
  await wheelButton.click({ timeout: 5000 });
  await expect(wheelButton).toBeDisabled();
  await closeCompletedBonus(page);
});

test("treasure pick bonus accepts four real card clicks", async ({ page }) => {
  await page.goto("/");
  await page.evaluate("launchPickBonus()");

  const cards = page.getByRole("button", { name: "PICK" });
  await expect(cards).toHaveCount(12);
  for (let index = 0; index < 4; index += 1) {
    await cards.nth(index).click();
  }

  await expect(page.locator(".pick-card:disabled")).toHaveCount(4);
  await closeCompletedBonus(page);
});

test("free-spins bonus completes all five spins", async ({ page }) => {
  test.setTimeout(30000);
  await page.goto("/");
  await page.evaluate("launchFreeSpinsBonus()");

  await expect(page.locator("#bonusTitle")).toHaveText("Free Spins Burst");
  await closeCompletedBonus(page, 20000);
});

test("mega 777 celebration can be dismissed", async ({ page }) => {
  await page.goto("/");
  await page.evaluate("void showMega777Overlay(125000)");

  await expect(page.locator("#bonusOverlay")).toHaveClass(/mega-777-mode/);
  await expect(page.getByAltText("777 mega jackpot celebration")).toBeVisible();
  await closeCompletedBonus(page);
});

test("tenth spin forces a bonus and leaves the game playable", async ({ page }) => {
  test.setTimeout(35000);
  await page.goto("/");
  await page.evaluate(`
    state.spinsSinceBonus = BONUS_GUARANTEE_SPINS - 1;
    getCurrentPack().jackpotOdds.mini = 0;
    getCurrentPack().jackpotOdds.major = 0;
    getCurrentPack().jackpotOdds.grand = 0;
    updateHUD();
  `);

  await expect(page.locator("#bonusMeterValue")).toHaveText("9 / 10");
  await page.getByRole("button", { name: "SPIN", exact: true }).click();
  await expect(page.locator("#bonusOverlay")).toHaveAttribute("aria-hidden", "false", { timeout: 8000 });

  const title = await page.locator("#bonusTitle").textContent();
  if (title === "Treasure Pick Bonus") {
    const cards = page.getByRole("button", { name: "PICK" });
    for (let index = 0; index < 4; index += 1) await cards.nth(index).click();
  } else if (title === "Power Wheel Bonus") {
    await page.getByRole("button", { name: "SPIN WHEEL" }).click();
  }

  await closeCompletedBonus(page, 20000);
  await expect(page.getByRole("button", { name: "SPIN", exact: true })).toBeEnabled();
  await expect(page.locator("#bonusMeterValue")).toHaveText("0 / 10");
});
