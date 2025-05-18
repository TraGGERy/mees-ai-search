import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Citation {
  text: string;
  doi?: string;
  metadata?: any;
}

/**
 * Format citation in APA style
 */
function formatAPACitation(metadata: any, doi?: string): string {
  if (!metadata || !metadata.title) {
    return `Unknown. (n.d.). ${doi ? `DOI: ${doi}` : ''}`;
  }
  
  const authors = metadata.authors || 'Unknown Author';
  const year = metadata.year || 'n.d.';
  const title = metadata.title || 'Unknown Title';
  const journal = metadata.journal || 'Unknown Journal';
  const volume = metadata.volume ? `, ${metadata.volume}` : '';
  const issue = metadata.issue ? `(${metadata.issue})` : '';
  const pages = metadata.pages ? `, ${metadata.pages}` : '';
  const url = doi ? `https://doi.org/${doi}` : metadata.url || '';

  return `${authors} (${year}). ${title}. ${journal}${volume}${issue}${pages}. ${url}`;
}

/**
 * Use ChatGPT to extract scholarly information
 */
async function getScholarlyInfoFromGPT(citation: string, doi?: string): Promise<any> {
  try {
    console.log(`Fetching scholarly info from GPT for citation: ${citation}`);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Using GPT-4o for best results
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: `You are a scholarly citation assistant with extensive knowledge of academic literature.
Extract detailed scholarly information from the citation text. If a DOI is provided, use that for additional context.
You should extract as much information as possible including:
1. Title (exact title of the paper)
2. Authors (full names, formatted properly)
3. Publication year
4. Journal/source name
5. Volume, issue, pages
6. Publisher
7. DOI (if available)
8. URL (if available)
9. A brief abstract or description (1-2 sentences summarizing the paper)
10. The field/discipline
11. Type of publication (article, book, conference paper, etc.)
12. Scholarly context (2-3 sentences describing the work's relevance and importance to its field)
13. Methodology (brief description of the methods used, if evident)
14. Key findings (1-2 key conclusions or results of the work)

Format the APA citation correctly based on the type of source.
Return your response as valid JSON with these fields. Use null for any field you cannot determine.
The format should be scholarly and professional, as this will be used to display citation information.`
        },
        {
          role: "user",
          content: `Extract complete scholarly information from this citation:
${citation}
${doi ? `DOI: ${doi}` : ''}

Return only valid JSON.`
        }
      ],
      response_format: { type: "json_object" }
    });

    const resultText = response.choices[0].message.content || '{}';
    const result = JSON.parse(resultText);
    
    // Format the metadata
    return {
      title: result.title || 'Unknown Title',
      authors: result.authors || 'Unknown Author',
      journal: result.journal || result.source || 'Unknown Journal',
      year: result.year || 'Unknown Year',
      doi: result.doi || doi || '',
      url: result.url || (doi ? `https://doi.org/${doi}` : ''),
      type: result.type || 'article',
      publisher: result.publisher || '',
      citationCount: result.citationCount || 0,
      abstract: result.abstract || result.description || '',
      source: 'gpt',
      volume: result.volume || '',
      issue: result.issue || '',
      pages: result.pages || '',
      field: result.field || result.discipline || '',
      scholarlyContext: result.scholarlyContext || '',
      methodology: result.methodology || '',
      keyFindings: result.keyFindings || '',
      apaCitation: result.apaCitation || formatAPACitation({
        title: result.title,
        authors: result.authors,
        year: result.year,
        journal: result.journal || result.source,
        volume: result.volume,
        issue: result.issue,
        pages: result.pages
      }, doi)
    };
  } catch (error) {
    console.error('Error getting scholarly info from GPT:', error);
    // Return basic info based on the citation text
    return {
      title: citation,
      authors: 'Unknown',
      journal: 'Unknown',
      year: 'Unknown',
      doi: doi || '',
      url: doi ? `https://doi.org/${doi}` : '',
      type: 'unknown',
      publisher: '',
      citationCount: 0,
      abstract: '',
      source: 'gpt',
      scholarlyContext: '',
      methodology: '',
      keyFindings: '',
      error: 'gpt_extraction_failed'
    };
  }
}

/**
 * Main API route for extracting and processing citations
 */
export async function POST(req: NextRequest) {
  try {
    // Set CORS headers for all responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    const { text } = await req.json();
    
    if (!text || text.trim().length === 0) {
      return new NextResponse(
        JSON.stringify({ error: 'No text provided' }), 
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }
    
    // First, extract explicit citations from the text
    const explicitCitationsCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: `You are a scholarly citation extraction specialist. Extract all explicit citations from the provided text.

For each citation found, extract:
1. The exact citation text
2. Any associated links or references
3. The context in which it appears
4. The type of citation (academic, website, book, etc.)

Format your response as a JSON object with this structure:
{
  "citations": [
    {
      "text": "The exact citation text as it appears in the source",
      "context": "The surrounding context that helps understand the citation",
      "type": "The type of citation (academic, website, book, etc.)",
      "reference": "Any reference number or link associated with the citation",
      "metadata": {
        "title": "Title of the work if available",
        "authors": "Author names if available",
        "year": "Publication year if available",
        "source": "Source of the citation",
        "url": "URL if available",
        "verification": "verified/partial/unverified"
      }
    }
  ]
}

Important:
- Only extract actual citations that appear in the text
- Include the full context around each citation
- Mark citations as "verified" only if you can confirm they are legitimate references
- Include any reference numbers or links that appear in the text
- If a citation appears multiple times, only include it once`
        },
        {
          role: "user",
          content: `Extract all explicit citations from this text:

${text}

Return only valid JSON with the specified structure.`
        }
      ],
      response_format: { type: "json_object" }
    });

    // Parse the explicit citations
    const explicitCitationsText = explicitCitationsCompletion.choices[0].message.content || '{"citations":[]}';
    const explicitCitationsResult = JSON.parse(explicitCitationsText);
    const explicitCitations = explicitCitationsResult.citations || [];

    // Now, identify topics and generate relevant scholarly sources
    const topicAnalysisCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: `You are a scholarly research specialist with expertise in identifying key topics and finding relevant academic sources.

Your task is to:
1. Identify the main topics and concepts discussed in the provided text
2. For each topic, suggest 2-3 highly relevant scholarly sources (books, academic papers, etc.) that would provide authoritative information on that topic
3. Include both classic foundational works and recent developments in the field

For each topic, provide:
1. The topic name
2. A brief description of why this topic is relevant to the text
3. 2-3 relevant scholarly sources with:
   - Title
   - Authors
   - Publication year
   - Brief description of why this source is relevant
   - Type of source (book, academic paper, etc.)

Format your response as a JSON object with this structure:
{
  "topics": [
    {
      "name": "Topic name",
      "relevance": "Why this topic is relevant to the text",
      "sources": [
        {
          "title": "Source title",
          "authors": "Author names",
          "year": "Publication year",
          "description": "Why this source is relevant",
          "type": "Type of source (book, academic paper, etc.)"
        }
      ]
    }
  ]
}

Important:
- Focus on identifying the most important academic topics in the text
- Suggest only high-quality, authoritative sources
- Include both foundational works and recent developments
- Make sure the sources are genuinely relevant to the topics discussed`
        },
        {
          role: "user",
          content: `Identify the main topics in this text and suggest relevant scholarly sources:

${text}

Return only valid JSON with the specified structure.`
        }
      ],
      response_format: { type: "json_object" }
    });

    // Parse the topic analysis
    const topicAnalysisText = topicAnalysisCompletion.choices[0].message.content || '{"topics":[]}';
    const topicAnalysisResult = JSON.parse(topicAnalysisText);
    const topics = topicAnalysisResult.topics || [];

    // Convert topics and their sources into citation format
    const suggestedCitations = topics.flatMap((topic: any) => 
      topic.sources.map((source: any) => ({
        text: `${source.title} by ${source.authors} (${source.year})`,
        context: `Relevant to the topic of ${topic.name}: ${topic.relevance}`,
        type: source.type || 'academic',
        reference: null,
        metadata: {
          title: source.title,
          authors: source.authors,
          year: source.year,
          source: source.type || 'Academic source',
          url: '',
          verification: 'suggested',
          description: source.description,
          topic: topic.name,
          topicRelevance: topic.relevance
        }
      }))
    );

    // Combine explicit and suggested citations
    const allCitations = [...explicitCitations, ...suggestedCitations];

    // Process each citation to extract additional metadata if needed
    const processedCitations = await Promise.all(allCitations.map(async (citation: any) => {
      // If we have a reference number, try to find the corresponding link
      if (citation.reference) {
        const linkMatch = text.match(new RegExp(`\\[${citation.reference}\\]\\((.*?)\\)`));
        if (linkMatch) {
          citation.metadata = {
            ...citation.metadata,
            url: linkMatch[1]
          };
        }
      }
      
      // If we don't have enough metadata, try to extract it from the citation text
      if (!citation.metadata?.title || !citation.metadata?.authors) {
        const scholarlyInfo = await getScholarlyInfoFromGPT(citation.text);
        citation.metadata = {
          ...citation.metadata,
          ...scholarlyInfo
        };
      }
      
      return citation;
    }));
    
    return new NextResponse(
      JSON.stringify({ citations: processedCitations }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  } catch (error: any) {
    console.error('Citation extraction error:', error);
    return new NextResponse(
      JSON.stringify({ error: error.message || 'Failed to process citation extraction request' }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      }
    );
  }
}

// OPTIONS handler for CORS preflight requests
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
} 