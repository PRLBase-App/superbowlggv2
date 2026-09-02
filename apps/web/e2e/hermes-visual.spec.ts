import { expect, test } from "playwright/test";
import fs from "node:fs";
import path from "node:path";

const viewports = [
  ["mobile-320x568", 320, 568], ["mobile-360x800", 360, 800],
  ["mobile-375x667", 375, 667], ["mobile-390x844", 390, 844],
  ["mobile-430x932", 430, 932], ["landscape-844x390", 844, 390],
  ["tablet-768x1024", 768, 1024], ["tablet-1024x768", 1024, 768],
  ["desktop-1366x768", 1366, 768], ["desktop-1440x900", 1440, 900],
  ["desktop-1920x1080", 1920, 1080],
] as const;
const crossBrowser = new Set(["mobile-360x800", "mobile-390x844", "tablet-768x1024", "desktop-1440x900"]);

for (const [label, width, height] of viewports) {
  test(`Superbowl landing ${label}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "visual-chromium" && !crossBrowser.has(label));
    await page.setViewportSize({ width, height });
    const response = await page.goto("/how-it-works", { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBeLessThan(400);
    await page.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}" });
    await page.evaluate(() => document.fonts.ready);
    await expect(page.getByRole("heading", { name: "How Superbowl.gg works" })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    const artifactDir = process.env.HERMES_VISUAL_ARTIFACT_DIR;
    if (!artifactDir) throw new Error("HERMES_VISUAL_ARTIFACT_DIR is required");
    fs.mkdirSync(artifactDir, { recursive: true });
    await page.screenshot({ path: path.join(artifactDir, `${testInfo.project.name}-${label}.png`), fullPage: true, animations: "disabled" });
  });
}
