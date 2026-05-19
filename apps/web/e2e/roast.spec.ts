import { test, expect } from "@playwright/test";

test("submits a password and shows a roast", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Password to evaluate").fill("password");
  await page.getByRole("button", { name: "Roast it" }).click();
  await expect(page.getByText(/named your password 'password'/i)).toBeVisible({ timeout: 10_000 });
});

test("hall of shame loads", async ({ page }) => {
  await page.goto("/hall-of-shame");
  await expect(page.getByRole("heading", { name: "Hall of Shame" })).toBeVisible();
});
