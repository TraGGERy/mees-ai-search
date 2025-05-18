import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Timeout for external API calls (10 seconds)
const API_TIMEOUT = 10000;

/**
 * Generate a citation using ChatGPT
 */
async function generateCitationWithGPT(doi: string) {
  try {
    console.log(`Generating citation for DOI: ${doi}`);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Using GPT-4o for best results
      temperature: 0.1,
      messages: [
        {
          role: "system",
          content: `You are a scholarly citation specialist with expertise in academic publications and researcher identification.
For the given DOI, generate complete scholarly metadata with precise attribution details.

Return information in this structure:
- title: The exact title of the paper or publication
- authors: Full author names formatted professionally (First Last, First Last, etc.)
- primaryAuthor: The primary or corresponding author with their full name and affiliation
- affiliations: Academic institutions or organizations of the authors if available
- authorCredentials: Notable credentials of key authors (e.g., "Professor at Oxford", "Nobel Laureate", "Leading researcher in X field")
- year: Publication year
- journal: Full journal or publication name
- volume: Volume number if available
- issue: Issue number if available
- pages: Page numbers if available
- publisher: Publisher name
- type: Type of publication (article, book, conference paper, etc.)
- abstract: A brief summary of the paper's content
- url: URL to access the publication
- citationCount: Approximate citation count if known (or 0)
- field: Academic field or discipline
- scholarlyContext: Brief description (2-3 sentences) of the paper's relevance, importance, and contribution to its field
- methodology: Brief notes on the methodology used, if applicable
- keyFindings: 1-2 key findings or conclusions of the work
- academicAuthority: Assessment of the scholarly authority of this publication (e.g., "Seminal work", "Highly cited", "From a prestigious institution")
- scholarImpact: Brief description of how this work has influenced subsequent research

Be factual, precise, and ensure all author attribution is accurate. Use null for any fields you cannot determine.
Your response must be valid JSON only.`
        },
        {
          role: "user",
          content: `Generate complete scholarly metadata for this DOI: ${doi}

Return only valid JSON with all required fields.`
        }
      ],
      response_format: { type: "json_object" }
    });

    const resultText = response.choices[0].message.content || '{}';
    const result = JSON.parse(resultText);
    
    // Format the metadata
    return {
      metadata: [{
        title: result.title || 'Unknown Title',
        author: result.authors || 'Unknown Author',
        primaryAuthor: result.primaryAuthor || '',
        affiliations: result.affiliations || '',
        authorCredentials: result.authorCredentials || '',
        year: result.year || 'Unknown Year',
        source_title: result.journal || 'Unknown Journal',
        doi: doi,
        url: result.url || `https://doi.org/${doi}`,
        type: result.type || 'article',
        publisher: result.publisher || '',
        abstract: result.abstract || '',
        volume: result.volume || '',
        issue: result.issue || '',
        page: result.pages || '',
        field: result.field || '',
        scholarlyContext: result.scholarlyContext || '',
        methodology: result.methodology || '',
        keyFindings: result.keyFindings || '',
        academicAuthority: result.academicAuthority || '',
        scholarImpact: result.scholarImpact || ''
      }],
      citationCount: result.citationCount || 0,
      source: 'gpt'
    };
  } catch (error: any) {
    console.error('Citation API error:', error);
    return {
      metadata: [{
        title: 'Error generating citation data',
        author: 'Unknown',
        year: 'Unknown',
        source_title: 'Unknown',
        doi: doi,
        type: 'unknown'
      }],
      citationCount: 0,
      source: 'error'
    };
  }
}

/**
 * Format citation data into APA style
 */
function formatCitation(citationData: any) {
  if (!citationData?.metadata || !Array.isArray(citationData.metadata) || citationData.metadata.length === 0) {
    return {
      formatted: null,
      error: 'No citation data found',
    };
  }

  try {
    const data = citationData.metadata[0];
    
    // Format authors
    const authors = data.author ? data.author.split(',').map((author: string) => {
      const parts = author.trim().split(' ');
      const lastName = parts[parts.length - 1];
      const initials = parts.slice(0, -1).map((part: string) => part[0] + '.').join(' ');
      return `${lastName}, ${initials}`;
    }).join(', ') : 'Unknown Author';

    // Extract first author's last name for in-text citation
    const firstAuthorLastName = authors.split(',')[0].trim();

    // Format the citation
    const formattedCitation = {
          title: data.title || 'Unknown Title',
      authors,
      primaryAuthor: data.primaryAuthor || '',
      affiliations: data.affiliations || '',
      authorCredentials: data.authorCredentials || '',
          journal: data.source_title || 'Unknown Journal',
          year: data.year || 'Unknown Year',
          doi: data.doi || '',
      url: data.url || `https://doi.org/${data.doi}`,
          type: data.type || 'article',
          publisher: data.publisher || '',
      citationCount: citationData.citationCount || 0,
      abstract: data.abstract || '',
      source: citationData.source || 'gpt',
      scholarlyContext: data.scholarlyContext || '',
      methodology: data.methodology || '',
      keyFindings: data.keyFindings || '',
      academicAuthority: data.academicAuthority || '',
      scholarImpact: data.scholarImpact || '',
      // APA formatted citation string
      apaCitation: `${authors} (${data.year || 'n.d.'}). ${data.title || 'Unknown Title'}. ${data.source_title || 'Unknown Journal'}${data.volume ? `, ${data.volume}` : ''}${data.issue ? `(${data.issue})` : ''}${data.page ? `, ${data.page}` : ''}. ${data.url || (data.doi ? `https://doi.org/${data.doi}` : '')}`,
      // In-text citation format
      inTextCitation: `(${firstAuthorLastName}${authors.includes(',') ? ' et al.' : ''}, ${data.year || 'n.d.'})`,
      scholarlyInfo: {
        citationCount: citationData.citationCount || 0,
        source: citationData.source || 'gpt',
        publicationDate: data.year || 'Unknown',
        publisher: data.publisher || '',
        volume: data.volume || '',
        issue: data.issue || '',
        pages: data.page || '',
        field: data.field || '',
        primaryAuthor: data.primaryAuthor || '',
        affiliations: data.affiliations || '',
        authorCredentials: data.authorCredentials || '',
        scholarlyContext: data.scholarlyContext || '',
        methodology: data.methodology || '',
        keyFindings: data.keyFindings || '',
        academicAuthority: data.academicAuthority || '',
        scholarImpact: data.scholarImpact || ''
      }
    };

    return {
      formatted: formattedCitation,
      error: null,
    };
  } catch (error) {
    console.error('Error formatting citation:', error);
    return {
      formatted: null,
      error: 'Error formatting citation',
    };
  }
}

/**
 * Generate a summary of the citation using OpenAI
 */
async function summarizeCitation(citation: any) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a helpful research assistant that summarizes academic citations concisely and accurately. Create a 3-4 sentence summary of the academic work described in the citation, highlighting:
1. The key contribution or finding
2. The methodology used (if available)
3. The significance or impact of the work in its field
4. Clear attribution to the specific scholars/researchers who conducted the work

Emphasize the scholarly authority of the authors with phrases like "According to [Author] from [Institution]" or "In this study by [Author], a leading researcher in [field]" to establish credibility.
Use academic language but avoid unnecessary jargon.`
        },
        {
          role: 'user',
          content: `Please summarize this academic work with clear attribution to the authors:
Title: ${citation.title}
Authors: ${citation.authors}
Primary Author: ${citation.primaryAuthor || 'Not specified'}
Affiliations: ${citation.affiliations || 'Not specified'}
Author Credentials: ${citation.authorCredentials || 'Not specified'}
Journal: ${citation.journal}
Year: ${citation.year}
Abstract: ${citation.abstract || 'Not available'}`
        }
      ]
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating summary:', error);
    return 'Unable to generate summary for this citation.';
  }
}

/**
 * Fetch related works for a given DOI (using ChatGPT for better reliability)
 */
async function fetchRelatedWorks(doi: string, page = 1) {
  try {
    console.log(`Generating related works for DOI: ${doi}`);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: `You are a scholarly citation specialist with expertise in academic relationships between papers.
For the given DOI, generate 5 realistic related works that might cite or be cited by this paper.

For each related work, include:
- citing: Title of the citing paper
- cited: Title of the cited paper 
- creation: Publication year
- journal_sc: Journal name
- author_sc: Primary author's name

The output should represent plausible related works in the same research area.
Return an array of 5 related works as valid JSON only.`
        },
        {
          role: "user",
          content: `Generate 5 plausible related works for DOI: ${doi}, page ${page}

Return only valid JSON array with 5 items containing the required fields.`
        }
      ],
      response_format: { type: "json_object" }
    });
    
    const result = JSON.parse(response.choices[0].message.content || '{"relatedWorks":[]}');
    return result.relatedWorks || [];
  } catch (error) {
    console.error('Error generating related works:', error);
    return [];
  }
}

/**
 * Main route handler for citations
 */
export async function POST(req: NextRequest) {
  try {
    // Set CORS headers for all responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };
    
    const { doi } = await req.json();
    
    if (!doi) {
      return new NextResponse(
        JSON.stringify({ error: 'No DOI provided' }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }

    // Generate citation data using GPT
    const citationData = await generateCitationWithGPT(doi);
    
    // Format the citation with proper styling
    const { formatted, error } = formatCitation(citationData);

    if (error || !formatted) {
      return new NextResponse(
        JSON.stringify({ error: error || 'Failed to format citation' }),
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }

    // Generate a summary of the citation
    const summary = await summarizeCitation(formatted);

    // Get related works
    const relatedWorks = await fetchRelatedWorks(doi);

    // Return all the data
    return new NextResponse(
      JSON.stringify({
        citation: formatted,
        summary,
        scholarlyInfo: formatted.scholarlyInfo,
        relatedWorks
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  } catch (error: any) {
    console.error('Citation error:', error);
    return new NextResponse(
      JSON.stringify({ error: error.message || 'Failed to process citation request' }),
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