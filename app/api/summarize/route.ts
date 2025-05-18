import { NextRequest, NextResponse } from 'next/server';

// Trusted source domains and platforms
const TRUSTED_SOURCES = {
  gaming: [
    'ign.com',
    'gamespot.com',
    'polygon.com',
    'pcgamer.com',
    'eurogamer.net',
    'kotaku.com',
    'destructoid.com',
    'rockpapershotgun.com'
  ],
  news: [
    'reuters.com',
    'apnews.com',
    'bbc.com',
    'theguardian.com',
    'nytimes.com',
    'washingtonpost.com'
  ],
  academic: [
    'nature.com',
    'science.org',
    'scholar.google.com',
    'researchgate.net',
    'academia.edu'
  ],
  tech: [
    'techcrunch.com',
    'wired.com',
    'theverge.com',
    'arstechnica.com',
    'cnet.com'
  ]
};

// Helper function to extract domain from URL
function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url.toLowerCase().replace('www.', '');
  }
}

// Verify if source is trusted
function isSourceTrusted(source: string): boolean {
  const domain = extractDomain(source);
  return Object.values(TRUSTED_SOURCES).some(
    sources => sources.some(trustedDomain => 
      domain.includes(trustedDomain) || trustedDomain.includes(domain)
    )
  );
}

// Verify citation format and source
function verifyCitation(citation: string): boolean {
  // Check if citation follows the required format
  const formatCheck = /^(According to|From) .+ \(\d{4}(-\d{2}-\d{2})?\): ".+"$/.test(citation);
  if (!formatCheck) return false;

  // Extract source from citation
  const sourceMatch = citation.match(/^(?:According to|From) (.+?) \(/);
  if (!sourceMatch) return false;

  const source = sourceMatch[1];
  return isSourceTrusted(source);
}

export async function POST(req: NextRequest) {
  const { input, tone } = await req.json();
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'Missing OpenAI API key.' }, { status: 500 });
  }
  if (!input || !tone) {
    return NextResponse.json({ error: 'Missing input or tone.' }, { status: 400 });
  }

  let systemPrompt = `You are a specialized citation verifier and formatter. Your task is to create accurately cited summaries using verified sources.

CITATION RULES:
1. SOURCE VERIFICATION
   - Use only well-known and trusted sources
   - Verify source authenticity against known domains
   - Include complete dates when available
   - Use official names for sources

2. CITATION FORMAT
   News/Gaming: According to [Source Name] (YYYY-MM-DD): "[EXACT QUOTE]"
   Academic: According to [Journal/Institution] (YYYY): "[EXACT QUOTE]"
   
3. TRUSTED SOURCES
   Gaming: IGN, GameSpot, Polygon, PC Gamer, Eurogamer
   News: Reuters, AP News, BBC, Guardian, NYTimes
   Academic: Nature, Science, Research Institutions
   Tech: TechCrunch, Wired, The Verge, Ars Technica

4. MANDATORY CHECKS
   - Verify source against trusted domains
   - Include complete dates
   - Use exact quotes
   - Maximum 5 lines total`;

  let userPrompt = `Create a ${tone} summary with verified citations. Follow these steps:

1. SOURCE SELECTION
   - Use only trusted sources from the provided list
   - Include full dates where available
   - Use exact source names
   
2. CITATION FORMAT
   Use these exact structures:
   - Gaming/News: According to [Source] (YYYY-MM-DD): "[QUOTE]"
   - Academic: According to [Source] (YYYY): "[QUOTE]"

3. VERIFICATION CHECKLIST
   ✓ Use trusted sources only
   ✓ Include complete dates
   ✓ Use exact quotes
   ✓ Maximum 5 lines total

Input text to process:
${input}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 512,
        temperature: 0.0,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error }, { status: 500 });
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content?.trim() || '';

    // Verify each citation in the summary
    const citations = summary.split('\n').filter((line: string) => line.trim());
    const verificationResults = citations.map((citation: string) => verifyCitation(citation));
    const allCitationsVerified = verificationResults.every((result: boolean) => result);

    return NextResponse.json({ 
      summary,
      citationsVerified: allCitationsVerified,
      verificationDetails: verificationResults.map((result: boolean, index: number) => ({
        citation: citations[index],
        verified: result
      }))
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
} 