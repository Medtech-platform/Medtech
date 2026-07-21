const fetch = require('node-fetch');
const { XMLParser } = require('fast-xml-parser');

const DEFAULT_SOURCES = [
  { name: 'MedCity News',        url: 'https://medcitynews.com/feed/' },
  { name: 'STAT News',           url: 'https://www.statnews.com/feed/' },
  { name: 'Healthcare IT News',  url: 'https://www.healthcareitnews.com/rss.xml' },
  { name: 'Healthcare Dive',     url: 'https://www.healthcaredive.com/feeds/news/' },
  { name: 'MedTech Dive',        url: 'https://www.medtechdive.com/feeds/news/' },
];

// Fetches one RSS feed and normalizes it into plain article objects.
// This runs on Netlify's server, not in the visitor's browser, so the
// site that owns the RSS feed never gets asked a CORS question at all.
async function fetchOneFeed(source) {
  try {
    const res = await fetch(source.url, {
      headers: { 'User-Agent': 'MindMachineIntelDaily/1.0' },
      timeout: 15000,
    });
    const xml = await res.text();
    const parser = new XMLParser({ ignoreAttributes: false });
    const parsed = parser.parse(xml);

    const channel = parsed.rss ? parsed.rss.channel : parsed.feed;
    let items = channel.item || channel.entry || [];
    if (!Array.isArray(items)) items = [items];

    const cutoff = Date.now() - 48 * 60 * 60 * 1000;

    return items
      .map((item) => {
        const title = (item.title && item.title['#text']) || item.title || '';
        const link = item.link && item.link['@_href'] ? item.link['@_href'] : (item.link || '');
        const rawDesc = item.description || item.summary || '';
        const desc = String(rawDesc).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 400);
        const pubDate = item.pubDate || item.published || item.updated || '';
        const pub = pubDate ? new Date(pubDate) : new Date();
        return {
          title: String(title).trim(),
          summary: desc,
          source: source.name,
          url: String(link).trim(),
          date: pub.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          pubTs: pub.getTime(),
        };
      })
      .filter((a) => a.title && a.pubTs > cutoff);
  } catch (err) {
    return []; // one bad feed shouldn't break the whole run
  }
}

async function fetchAllFeeds(sources) {
  const list = sources && sources.length ? sources : DEFAULT_SOURCES;
  const results = await Promise.all(list.map(fetchOneFeed));
  const merged = results.flat();
  const seen = new Set();
  return merged.filter((a) => {
    if (seen.has(a.title)) return false;
    seen.add(a.title);
    return true;
  });
}

module.exports = { fetchAllFeeds, DEFAULT_SOURCES };
