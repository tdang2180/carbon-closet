const functions = require('firebase-functions');
const axios = require('axios');
const cheerio = require('cheerio');

const extractPrice = (priceStr) => {
  const priceMatch = priceStr.match(/\$([\d,.]+)/);
  if (priceMatch) {
    return parseFloat(priceMatch[1].replace(/,/g, ''));
  }
  return null;
};

const getAveragePrice = async (searchQuery) => {
  try {
    const eBayUrl = 'https://www.ebay.com/sch/i.html';
    const searchQueryFormatted = searchQuery.replace(/\s+/g, '+');
    
    const params = {
      '_from': 'R40',
      '_nkw': searchQueryFormatted,
      'LH_ItemCondition': 1500,
      'LH_PrefLoc': 1,
      '_udlo': '10',
      '_udhi': '100',
      '_dcat': 11450,
      '_sacat': 0,
      '_sop': 10,
      'LH_Sold': '1',
      'LH_Complete': '1',
      'LH_BIN': '0',
      'LH_Auction': '0',
      'LH_BO': '0',
    };

    const url = new URL(eBayUrl);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    const response = await axios.get(url.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    const prices = [];

    $('span.BOLD').each((index, element) => {
      const priceText = $(element).text().trim();
      const price = extractPrice(priceText);
      if (price) {
        prices.push(price);
      }
    });

    if (prices.length === 0) {
      return null;
    }

    const averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    return Math.round(averagePrice * 100) / 100;
  } catch (error) {
    console.error('Error fetching eBay prices:', error);
    return null;
  }
};

exports.getPrice = functions.https.onCall(async (data, context) => {
  try {
    const { query } = data;

    if (!query) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing search query'
      );
    }

    const averagePrice = await getAveragePrice(query);

    if (averagePrice === null) {
      throw new functions.https.HttpsError(
        'not-found',
        'Could not determine average price for this item'
      );
    }

    return {
      average_price: averagePrice,
      search_term: query
    };
  } catch (error) {
    console.error('Price lookup error:', error);
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'Failed to get price'
    );
  }
});
