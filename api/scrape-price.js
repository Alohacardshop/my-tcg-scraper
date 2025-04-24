import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ error: 'Missing productId' });
  }

  // Minimal filtered URL
  const url = `https://www.tcgplayer.com/product/${productId}/?page=1`;

  try {
    const browserlessResponse = await fetch('https://chrome.browserless.io/content?token=SBtaXKzPHtM4Gvf9011124547bb74fdc0ef45b5e29', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    const html = await browserlessResponse.text();
    const $ = cheerio.load(html);

    // ✅ Updated
