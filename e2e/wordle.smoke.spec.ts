import { test, expect } from "@playwright/test";

async function typeOnScreen(page: import("@playwright/test").Page, word: string) {
  const keyboard = page.getByRole("group", { name: /on-screen keyboard/i });
  for (const ch of word) {
    await keyboard.getByRole("button", { name: ch.toUpperCase(), exact: true }).click();
  }
}

test.describe("Tonni Wordle smoke @smoke", () => {
  test("home routes to Wordle", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Tonni Games" }),
    ).toBeVisible();
    await page.getByRole("link", { name: /play wordle/i }).click();
    await expect(page).toHaveURL(/\/wordle$/);
    await expect(page.getByText(/Wordle/i).first()).toBeVisible();
  });

  test("wordle board and keyboard are playable without overflow", async ({
    page,
  }) => {
    await page.goto("/wordle");
    await expect(page.getByRole("grid")).toBeVisible();
    const keyboard = page.getByRole("group", {
      name: /on-screen keyboard/i,
    });
    await expect(keyboard).toBeVisible();

    await typeOnScreen(page, "crane");
    await expect(page.getByRole("img", { name: "C, filled" })).toBeVisible();
    await expect(page.getByRole("img", { name: "E, filled" })).toBeVisible();

    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      return doc.scrollWidth > doc.clientWidth + 1;
    });
    expect(overflow).toBe(false);

    const keyBox = await keyboard
      .getByRole("button", { name: "A", exact: true })
      .boundingBox();
    expect(keyBox).toBeTruthy();
    expect(keyBox!.height).toBeGreaterThanOrEqual(40);
  });

  test("reject invalid guess with live feedback", async ({ page }) => {
    await page.goto("/wordle");
    await expect(page.getByRole("grid")).toBeVisible();
    await typeOnScreen(page, "xqzjk");
    await expect(page.getByRole("img", { name: "K, filled" })).toBeVisible();
    await page
      .getByRole("group", { name: /on-screen keyboard/i })
      .getByRole("button", { name: "Enter" })
      .click();
    await expect(page.getByRole("status")).toContainText(/not in word list/i);
  });
});
