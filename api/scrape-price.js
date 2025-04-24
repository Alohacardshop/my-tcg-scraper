import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;

  if (!url || !url.includes('tcgplayer.com/product')) {
    return res.status(400).json({ error: 'A valid TCGPlayer product URL is required.' });
  }

  try {
    const browserlessResponse = await fetch('https://chrome.browserless.io/content?token=SBtaXKzPHtM4Gvf9011124547bb74fdc0ef45b5e29', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    const html = await browserlessResponse.text();
    const $ = cheerio.load(html);

    // ✅ Use price-points__value to get market price
    const price = $('.price-points__value').first().text().trim().replace(/[^0-9.]/g, '');

    if (!price) {
      throw new Error('Market price not found');
    }

    return res.status(200).json({
      price,
      url,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Scraping error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
