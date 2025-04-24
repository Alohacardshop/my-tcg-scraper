import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { productId, condition, language, isFirstEdition, isHolo } = req.body;

  let url = `https://www.tcgplayer.com/product/${productId}/?page=1`;
  if (language) url += `&Language=${encodeURIComponent(language)}`;
  if (condition) url += `&Condition=${encodeURIComponent(condition.replace(/_/g, ' '))}`;
  if (isFirstEdition) url += '&Printing=1st+Edition';
  if (isHolo) url += '&Treatment=Holofoil';

  try {
    const browserlessResponse = await fetch('https://chrome.browserless.io/content?token=SBtaXKzPHtM4Gvf9011124547bb74fdc0ef45b5e29', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    const html = await browserlessResponse.text();
    const $ = cheerio.load(html);
    const price = $('[data-testid="price-guide-price"]').first().text().trim().replace(/[^0-9.]/g, '');

    if (!price) throw new Error('Price not found');

    return res.status(200).json({ price, url, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
