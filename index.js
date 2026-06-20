// npm install playwright
// npm install playwright
const { chromium } = require("playwright");

async function scrapeGoogleBusiness(url) {
  const MAPS_URL = url;
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(MAPS_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(3000);

  const data = {};

  try {
    data.name = (await page.locator("h1").first().textContent()) || null;
  } catch {
    data.name = null;
  }

  try {
    data.rating =
      (await page.locator('div[role="main"] span[role="img"]').first().getAttribute("aria-label")) || null;
  } catch {
    data.rating = null;
  }

  try {
    const rc = await page.locator('button[jsaction*="reviews"]').first().textContent();
    data.reviewCount = rc || null;
  } catch {
    data.reviewCount = null;
  }

  try {
    const reviewButton = page.locator('button[jsaction*="reviews"]').first();
    if (await reviewButton.count()) {
      await reviewButton.click();
      await page.waitForTimeout(2000);
      for (let i = 0; i < 10; i++) {
        await page.mouse.wheel(0, 3000);
        await page.waitForTimeout(500);
      }
    }
  } catch {}

  try {
    data.reviews = await page.$$eval('[data-review-id]', reviews =>
      reviews.map(r => ({
        text: r.querySelector('[class*="review"]')?.innerText || "",
        author: r.querySelector('button[aria-label]')?.innerText || "",
      }))
    );
  } catch {
    data.reviews = [];
  }

  try {
    data.images = await page.$$eval("img", imgs => imgs.map(i => i.src).filter(s => s.includes("googleusercontent")));
    data.images = [...new Set(data.images)];
  } catch {
    data.images = [];
  }

  try {
    const coords = await page.$$eval('meta[itemprop="latitude"], meta[itemprop="longitude"]', metas =>
      metas.map(m => m.getAttribute('content'))
    );
    if (coords && coords.length >= 2) {
      data.latitude = Number(coords[0]) || null;
      data.longitude = Number(coords[1]) || null;
    }
  } catch {}

  await browser.close();
  return data;
}

module.exports = { scrapeGoogleBusiness };