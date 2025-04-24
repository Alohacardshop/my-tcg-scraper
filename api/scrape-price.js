export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;

  if (!url || !url.includes('tcgplayer.com/product')) {
    return res.status(400).json({ error: 'A valid TCGPlayer product URL is required.' });
  }

  try {
    const browserlessResponse = await fetch('https://chrome.browserless.io/function?token=SBtaXKzPHtM4Gvf9011124547bb74fdc0ef45b5e29', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: `
          async ({ page }) => {
            await page.goto("${url}", { waitUntil: "networkidle" });
            await page.waitForSelector(".price-points__value", { timeout: 10000 });

            const price = await page.$eval(".price-points__value", el => el.textContent.trim());
            return { price };
          }
        `
      })
    });

    const result = await browserlessResponse.json();

    if (!result || !result.price) {
      throw new Error('Market price not found');
    }

    return res.status(200).json({
      price: result.price.replace(/[^0-9.]/g, ''),
      url,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Scraper error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
