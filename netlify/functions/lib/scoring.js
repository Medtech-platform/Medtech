const fetch = require('node-fetch');

const DEFAULT_HIGH = `Directly relevant to medical device or healthcare business intelligence:
- FDA approvals, clearances, or enforcement actions
- Clinical trial results for medical devices or therapeutics
- Competitor product launches, M&A, or strategic moves
- Market sizing data, growth forecasts, or analyst reports
- Reimbursement or regulatory policy changes
- Funding rounds or IPOs in medtech/biotech`;

const DEFAULT_MED = `Adjacent but useful:
- General healthcare system news
- Digital health and health IT trends
- Hospital network changes or health system deals
- Insurance and payer dynamics`;

const DEFAULT_LOW = `Deprioritize:
- Sports, entertainment, celebrity news
- General politics unrelated to healthcare
- International news not affecting the market`;

async function callGemini(prompt, maxTokens) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is not set in Netlify environment variables');

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: maxTokens || 1000, temperature: 0.2 },
      }),
    }
  );
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return (data.candidates && data.candidates[0] && data.candidates[0].content.parts[0].text) || '';
}

async function scoreArticles(articles, rules) {
  const highRule = (rules && rules.highRule) || DEFAULT_HIGH;
  const medRule = (rules && rules.medRule) || DEFAULT_MED;
  const lowRule = (rules && rules.lowRule) || DEFAULT_LOW;
  const orgContext = (rules && rules.orgContext) || process.env.ORG_CONTEXT || '';

  const batchSize = 12;
  const scored = [];

  for (let i = 0; i < articles.length; i += batchSize) {
    const batch = articles.slice(i, i + batchSize);
    const artList = batch
      .map((a, j) => `[${j}] TITLE: ${a.title}\nSOURCE: ${a.source}\nSNIPPET: ${(a.summary || '').slice(0, 250)}`)
      .join('\n\n');

    const prompt = `You are an intelligence analyst. Score each article for relevance.

ORG CONTEXT: ${orgContext}

HIGH RELEVANCE:
${highRule}

MEDIUM RELEVANCE:
${medRule}

LOW RELEVANCE / EXCLUDE:
${lowRule}

For HIGH/MEDIUM articles: write a professional 3-5 sentence summary for a business intelligence audience (what happened, why it matters, implications). For LOW: write 1 sentence.

Articles:
${artList}

Respond ONLY with valid JSON (no markdown, no text before/after):
{"articles":[{"relevance":"high|medium|low","summary":"..."}]}

Return exactly ${batch.length} items in the same order.`;

    try {
      const raw = await callGemini(prompt, 2000);
      const clean = raw.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      parsed.articles.forEach((a, j) => {
        if (batch[j]) {
          batch[j].relevance = a.relevance || 'low';
          batch[j].aiSummary = a.summary || batch[j].summary;
        }
      });
    } catch (e) {
      batch.forEach((a) => {
        a.relevance = 'low';
        a.aiSummary = a.summary;
      });
    }
    scored.push(...batch);
    await new Promise((r) => setTimeout(r, 400)); // stay under Gemini's rate limit
  }

  return scored;
}

module.exports = { scoreArticles, callGemini, DEFAULT_HIGH, DEFAULT_MED, DEFAULT_LOW };
