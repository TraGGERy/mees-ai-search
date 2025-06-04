import { NextRequest, NextResponse } from 'next/server';
import { academicHumanize } from '@/lib/wordHumanizer';

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

  let systemPrompt = `You are an academic writing assistant. Your task is to write a well-structured, well-formatted, and comprehensive research paper based on the provided information, using only verified and trusted sources for citations.

PAPER REQUIREMENTS:
1. STRUCTURE
   - Title page (with title, author, date)
   - Abstract (concise summary of the paper)
   - Introduction (background, context, and thesis statement)
   - Main Body (multiple sections with headings, in-depth analysis, arguments, evidence, and discussion)
   - Conclusion (summarize findings, implications, and future directions)
   - References (properly formatted, only trusted sources)

2. CITATION RULES
   - Use only well-known and trusted sources
   - Verify source authenticity against known domains
   - Include complete dates when available
   - Use official names for sources
   - Use in-text citations in APA style (Author, Year)
   - Provide a full reference list at the end

3. FORMATTING
   - Academic tone and style
   - Well-organized paragraphs and sections
   - Use bullet points, numbered lists, and tables where appropriate
   - Maximum clarity and coherence
   - The paper MUST be at least 5 to 6 full pages (minimum 4000 words; aim for 4000+ words)

4. TRUSTED SOURCES
   Gaming: IGN, GameSpot, Polygon, PC Gamer, Eurogamer
   News: Reuters, AP News, BBC, Guardian, NYTimes
   Academic: Nature, Science, Research Institutions
   Tech: TechCrunch, Wired, The Verge, Ars Technica

5. MANDATORY CHECKS
   - Verify source against trusted domains
   - Include complete dates
   - Use exact quotes for direct citations
   - Ensure all references are from trusted sources
   - The output must be at least 5 to 6 full pages (minimum 4000 words)`;

  let userPrompt = `Write a comprehensive, well-formatted research paper in an academic style, based on the following information. Follow these steps:

1. STRUCTURE
   - Title page
   - Abstract
   - Introduction
   - Main Body (with sections and headings)
   - Conclusion
   - References (APA style, trusted sources only)

2. CITATION FORMAT
   - Use in-text citations (Author, Year)
   - Reference list at the end
   - Use only trusted sources from the provided list
   - Include full dates where available
   - Use exact source names

3. VERIFICATION CHECKLIST
   ✓ Use trusted sources only
   ✓ Include complete dates
   ✓ Use exact quotes for direct citations
   ✓ Academic tone and formatting
   ✓ The paper MUST be at least 5 to 6 full pages (minimum 4000 words; aim for 4000+ words)

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
    let summary = data.choices?.[0]?.message?.content?.trim() || '';

    // Humanize the AI-generated text for more natural output
    summary = academicHumanize(summary);

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