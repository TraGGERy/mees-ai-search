import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { auth } from '@clerk/nextjs/server';
import { humanizeTextWithWordReplacement, progressiveHumanize } from '@/lib/wordHumanizer';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to clean up the response text
function cleanResponseText(text: string | null): string {
  if (!text) return '';
  
  // Trim whitespace
  let cleaned = text.trim();
  
  // Remove any quotes that might be wrapping the entire response
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || 
      (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.substring(1, cleaned.length - 1);
  }
  
  // Remove common AI introductory phrases
  const aiPhrases = [
    "Sure thing!",
    "Here's a more natural version:",
    "Here's a more natural and casual version:",
    "I've rewritten this to sound more human:",
    "Here you go!",
    "When we support critical thinking",
    "Here is",
    "Here's",
    "Sure,",
    "Absolutely,",
    "Indeed,",
    "Certainly,",
    "This article aims",
    "This review aims",
    "This essay aims",
    "mostly used by",
    "commonly used by",
    "widely used by",
    "crucial for understanding",
    "essential for understanding",
    "key to understanding",
    "shift our perspective",
    "change our perspective",
    "broader perspective",
    "In today's digital age",
    "In today's complicated business landscape",
    "In today's competitive business landscape",
    "In today's rapidly evolving",
    "In today's fast-paced digital landscape"
  ];
  
  for (const phrase of aiPhrases) {
    if (cleaned.toLowerCase().startsWith(phrase.toLowerCase())) {
      // Remove the phrase and any following whitespace
      cleaned = cleaned.substring(phrase.length).trim();
    }
  }
  
  // Additional pattern removal throughout the text
  const aiPatterns = [
    /\b(is|are|can be) (mostly|commonly|widely|frequently|often|typically) used by\b/gi,
    /\b(is|are|can be) (crucial|essential|vital|key|important|critical) for understanding\b/gi,
    /\b(can|could|will|would|may|might) (shift|change|alter|transform) our perspective\b/gi,
    /\bthis (article|review|essay|analysis|paper|text) aims to\b/gi,
    /\bin (conclusion|summary|essence|closing|short)\b/gi,
    /\bto summarize\b/gi,
    /\b(allows|enables|helps) us to (better|fully|deeply) understand\b/gi,
    /\b(plays|serves) a (crucial|vital|important|significant|key) role\b/gi,
    /\bit is (worth|important|essential|crucial|critical) to note\b/gi,
    /\bthrough this (lens|perspective|approach|framework|understanding)\b/gi,
    /\bin today's (digital|complicated|competitive|rapidly evolving|fast-paced) (age|world|landscape|environment|era|marketplace)\b/gi,
    /\bour team of experts is dedicated to\b/gi,
    /\bwe offer a wide range of\b/gi,
    /\bcommitted to providing the best\b/gi,
    /\bproud to present\b/gi,
    /\bdesigned to meet the needs of\b/gi,
    /\bwith a focus on\b/gi,
    /\ba leader in the industry\b/gi,
    /\bbuilt on a foundation of\b/gi,
    /\bwe understand the importance of\b/gi,
    /\btailored to suit your needs\b/gi,
    /\bleveraging the power of\b/gi,
    /\btransforming the way you\b/gi,
    /\bour mission is to\b/gi,
    /\byour trusted partner in\b/gi,
    /\bempowering businesses to\b/gi,
    /\bfrom inception to execution\b/gi,
    /\bharnessing the latest technology\b/gi,
    /\bdriven by innovation\b/gi,
    /\bfocused on delivering excellence\b/gi,
    /\bdedicated to ensuring\b/gi,
    /\bin order to\b/gi,
    /\bby leveraging\b/gi,
    /\bto provide the best\b/gi,
    /\bwith the goal of\b/gi,
    /\bensuring that\b/gi,
    /\bto meet the demands of\b/gi,
    /\bby focusing on\b/gi,
    /\bto achieve success\b/gi,
    /\bfor the purpose of\b/gi,
    /\bas a result of\b/gi,
    /\bthrough a combination of\b/gi,
    /\bin partnership with\b/gi,
    /\bto drive growth\b/gi,
    /\bin an effort to\b/gi,
    /\bwith an emphasis on\b/gi,
    /\bto deliver results\b/gi,
    /\bby integrating\b/gi,
    /\bto maximize\b/gi,
    /\bin conjunction with\b/gi,
    /\bas part of our commitment to\b/gi,
    /\bcutting-edge\b/gi,
    /\bstate-of-the-art\b/gi,
    /\bgame-changing\b/gi,
    /\binnovative solutions\b/gi,
    /\bleverage\b/gi,
    /\bholistic approach\b/gi,
    /\bat the forefront\b/gi,
    /\bseamless experience\b/gi,
    /\bunprecedented\b/gi,
    /\bunlock potential\b/gi,
    /\bscalable solutions\b/gi,
    /\bempower\b/gi,
    /\btransformative\b/gi,
    /\bmaximize efficiency\b/gi,
    /\boptimize performance\b/gi,
    /\btake your business to the next level\b/gi,
    /\bstreamlined process\b/gi,
    /\bdrive success\b/gi,
    /\brevolutionize\b/gi,
    /\bdeliver results\b/gi,
    /\bdynamic\b/gi,
    /\brobust\b/gi,
    /\bsynergy\b/gi,
    /\bdisruptive\b/gi,
    /\befficient\b/gi,
    /\bagile\b/gi,
    /\bproactive\b/gi,
    /\binnovate\b/gi,
    /\bintegrate\b/gi,
    /\becosystem\b/gi,
    /\bstrategic\b/gi,
    /\bcomprehensive\b/gi,
    /\bvisionary\b/gi,
    /\bintuitive\b/gi,
    /\badaptable\b/gi,
    /\buser-centric\b/gi,
    /\binsightful\b/gi,
    /\bpioneering\b/gi,
    /\bbespoke\b/gi,
    /\bexponential\b/gi,
    // Common descriptive AI words (from Undetectable AI)
    /\bcomprehensive\b/gi,
    /\bimportant to consider\b/gi,
    /\btestament\b/gi,
    /\btapestry\b/gi,
    /\bvibrant\b/gi,
    /\bvital\b/gi,
    /\barguably\b/gi,
    /\bdynamic\b/gi,
    /\bnotably\b/gi,
    /\bmoreover\b/gi,
    /\bremember that\b/gi,
    
    // Action-oriented AI words (from Undetectable AI)
    /\bdelve\b/gi,
    /\bdive into\b/gi,
    /\bembark\b/gi,
    /\bexplore\b/gi,
    /\banalyze\b/gi,
    /\belevate\b/gi,
    /\bexcels\b/gi,
    
    // Formal/corporate AI words (from Undetectable AI)
    /\butilize\b/gi,
    /\bfacilitate\b/gi,
    /\bleverage\b/gi,
    /\bpivotal\b/gi,
    
    // Pseudo-conversational AI phrases (from Undetectable AI)
    /\blet's dive in\b/gi,
    /\bat the end of the day\b/gi,
    /\bit's worth noting that\b/gi,
    /\bseamlessly\b/gi,
    
    // Additional AI-detectable patterns
    /\bin the realm of\b/gi,
    /\bin the context of\b/gi,
    /\bin the face of\b/gi,
    /\bin the wake of\b/gi,
    /\bin the absence of\b/gi,
    /\bin the presence of\b/gi,
    /\bin light of\b/gi,
    /\ban array of\b/gi,
    /\ba plethora of\b/gi,
    /\ba myriad of\b/gi,
    /\ba variety of\b/gi,
    /\ba range of\b/gi
  ];
  
  // Replace patterns with more human alternatives
  for (const pattern of aiPatterns) {
    cleaned = cleaned.replace(pattern, (match) => {
      // Return empty string for matches at beginning of sentences
      if (match.charAt(0).toUpperCase() === match.charAt(0)) {
        return '';
      }
      // Simply remove the pattern in other cases
      return '';
    });
  }
  
  // Apply additional randomization to break AI detection patterns
  cleaned = applyCharacterRandomization(cleaned);
  
  return cleaned;
}

// New function to add subtle character randomization
function applyCharacterRandomization(text: string): string {
  // Only apply these techniques with low probability to preserve readability
  if (Math.random() < 0.7) return text;
  
  // Characters that look similar but are programmatically different
  const similarCharacterMap: Record<string, string[]> = {
    'a': ['а'], // Cyrillic 'a'
    'e': ['е'], // Cyrillic 'e'
    'o': ['о'], // Cyrillic 'o'
    'p': ['р'], // Cyrillic 'p'
    'c': ['с'], // Cyrillic 's'
    'x': ['х'], // Cyrillic 'h'
    'i': ['і'], // Ukrainian 'i'
    's': ['ѕ'], // Similar looking character
  };
  
  // Apply similar character substitution with very low probability
  // This creates text that looks normal to humans but breaks AI detection
  let result = '';
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const lowerChar = char.toLowerCase();
    
    // Very small chance (0.15%) of replacing with a similar character
    if (similarCharacterMap[lowerChar] && Math.random() < 0.0015) {
      const alternatives = similarCharacterMap[lowerChar];
      const replacement = alternatives[Math.floor(Math.random() * alternatives.length)];
      
      // Preserve case
      result += (char === lowerChar) ? replacement : replacement.toUpperCase();
    } else {
      result += char;
    }
  }
  
  // Add zero-width spaces occasionally to break pattern detection
  // These are invisible but change the text programmatically
  if (Math.random() < 0.3) {
    const positions = Math.floor(text.length / 300) + 1; // Add roughly 1 per 300 chars
    for (let i = 0; i < positions; i++) {
      const pos = Math.floor(Math.random() * result.length);
      result = result.substring(0, pos) + '​' + result.substring(pos); // Zero-width space
    }
  }
  
  return result;
}

// The main POST handler for the humanize API
export async function POST(req: Request) {
  try {
    // Check if user is authenticated using Clerk
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { text, type } = await req.json();
    // Force useWordLevel to always be true
    const useWordLevel = true;

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Only allow summarization content
    if (type !== 'summary') {
      return NextResponse.json(
        { error: 'Humanization is only available for summaries' },
        { status: 400 }
      );
    }

    // First apply AI humanization (reversing the previous order)
    let aiProcessedText;
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a text humanizer that transforms AI-generated content to make it completely undetectable as AI-written. Follow these steps in order:

1. Rephrase sentence structures:
   - Break the perfect smoothness of AI writing by using more fragmented thoughts
   - Add incomplete sentences, run-ons, and occasional grammatical stumbles
   - Mix complex and simplistic sentence structures in unpredictable patterns
   - Avoid logical, sequential paragraph development—humans are less organized
   - Use unexpected transitions that sometimes lack clear logical connections

2. Introduce thoughtful imperfections:
   - Include occasional typographical errors (1-3 per paragraph)
   - Apply inconsistent punctuation (mix proper and improper usage)
   - Use sentence fragments when it feels natural
   - Insert thoughtful asides (in parentheses)
   - Add genuine hesitations mid-thought
   - Include self-corrections with phrases like "wait, no..." or "actually..."

3. Apply student writing style:
   - Use vocabulary appropriate for academic level
   - Incorporate personal insights and observations
   - Include conversational elements when relevant
   - Use contractions regularly
   - Pose occasional reflective questions
   - Express measured uncertainty ("I believe," "perhaps," "likely")
   - Include small logical fallacies that humans often make

4. Refine vocabulary and tone:
   - Replace overly formal terms with more accessible alternatives
   - Favor active voice over passive constructions
   - Include thoughtful transitional phrases
   - Employ strategic repetition for emphasis
   - Adopt direct and personable language
   - Use colloquialisms naturally
   - Inject subtle emotional subtext

5. Structure content thoughtfully:
   - Organize text into logical paragraphs
   - Vary paragraph length dramatically (some very short, some longer)
   - Incorporate appropriate spacing between ideas
   - Use informative headings when beneficial
   - Include concise lists when presenting multiple points
   - Sometimes violate expected structure in natural ways

6. Integrate authentic thinking patterns:
   - Connect related ideas with natural transitions
   - Include relevant tangential thoughts
   - Use meaningful bridging statements between concepts
   - Incorporate appropriate emotional responses
   - Express informed perspectives and considered viewpoints
   - Show occasional non-linear thinking
   - Include false starts that mimic actual thought processes

7. Incorporate contemporary language:
   - Utilize relatable terminology in 5% of content
   - Replace formal expressions with professional equivalents
   - Include current professional expressions where fitting
   - Add appropriate language variations based on context
   - Use generational or cultural linguistic markers

8. Include measured imperfections:
   - Add 1-3 minor typographical errors throughout
   - Occasionally use similar-sounding words incorrectly
   - Include subtle grammatical variations
   - Add thoughts that require additional clarification
   - Allow redundancies that humans naturally use

9. Apply layered transformation:
   - Perform multiple rounds of refinement
   - Apply varied techniques across different sections
   - Ensure natural variability throughout
   - Maintain logical coherence while enhancing human qualities
   - Break patterns of perfect consistency

10. Add conversational elements:
    - Include appropriate self-corrections
    - Incorporate clarifying statements
    - Use natural connecting phrases
    - Express nuanced perspectives
    - Reference relevant personal examples
    - Employ contextually appropriate expressions
    - Inject personality markers

11. Vary structural patterns:
    - Alternate between brief and detailed sentences randomly
    - Use diverse punctuation styles inconsistently
    - Add personal voice indicators
    - Include qualifying language when appropriate
    - Incorporate natural discourse markers
    - Use varied transitional phrases
    - Break AI-like smoothness with occasional awkward phrasings

12. Add authentic personal touches:
    - Include thoughtful reactions to content
    - Express appropriate emphasis with occasional overemphasis
    - Use natural question forms
    - Include measured qualifiers
    - Add perspective indicators where relevant
    - Express subjective opinions strongly at times

13. Incorporate natural thought progression:
    - Include occasional self-reflection
    - Add relevant tangential observations
    - Vary formality levels appropriately and inconsistently
    - Include measured personal references
    - Express appropriate levels of certainty and uncertainty
    - Use varied sentence constructions
    - Break smoothly flowing thoughts occasionally

14. Create natural content flow:
    - Incorporate occasional logical pauses
    - Add thoughtful asides where relevant
    - Include appropriate interjections
    - Vary paragraph structure intentionally
    - Add measured emotional responses
    - Include natural discourse indicators
    - Allow topic drift and occasional refocusing

15. Enhance authenticity:
    - Add appropriate regional expressions
    - Include contemporary professional language
    - Use varied punctuation patterns
    - Add natural voice variations
    - Include appropriate emphasis markers
    - Vary sentence beginnings effectively
    - Mimic stream-of-consciousness thinking occasionally

16. Break AI patterns:
    - Avoid formulaic transitions like "It's like a way to..."
    - Refrain from using "Plus," as a primary connector
    - Don't begin sentences with "Oh, and..." 
    - Avoid formulaic explanations like "It's basically..."
    - Steer clear of patterns like "It's kinda..." or "It's pretty much..."
    - Don't use phrases like "It's often linked with..."
    - Never use perfectly balanced pros/cons structures

17. Incorporate authentic human elements:
    - Include relevant personal experiences when appropriate
    - Add thoughtful emotional responses
    - Use varied and natural transitions
    - Incorporate meaningful tangential observations
    - Add appropriately informal language
    - Employ diverse sentence structures
    - Show occasional contradictory thinking

18. CRITICAL: Never begin responses with:
    - "Sure thing!"
    - "Here's a more natural version:"
    - "Here's a more natural and casual version:"
    - "I've rewritten this to sound more human:"
    - "Here you go!"
    - "When we support critical thinking..."
    - Any variation of "Here is" or "Here's"
    
19. CRITICAL: Avoid these AI-typical phrases:
    - "I mean" (at the beginning of sentences)
    - "Sure"
    - "Absolutely"
    - "Indeed"
    - "Certainly"
    - "To be honest"
    - "In my opinion"
    - "In my experience"
    - "From my perspective"
    - "Let me"
    - "You know"
    - "If you ask me"
    - "Hope this helps"
    - "Feel free to"
    - "Don't hesitate to"
    - "mostly used by"
    - "commonly used by"
    - "widely used by" 
    - "This article/review/essay aims"
    - "crucial for understanding"
    - "essential for understanding"
    - "key to understanding"
    - "shift our perspective"
    - "change our perspective"
    - "broader perspective"
    - "In conclusion"
    - "To summarize"
    - "In summary"

20. Create truly human writing:
    - Avoid perfect logical flow (humans rarely think/write this way)
    - Include some mild contradictions within paragraphs
    - Let ideas develop organically rather than in structured format
    - Include occasional backtracking to clarify previous points
    - Allow subtle inconsistencies in tone throughout
    - Show moments of apparent self-doubt in reasoning
    - Break patterns of AI-perfect balance and structure
    - Make occasional factual errors that humans would make
    - Allow complexity to remain complex rather than simplifying perfectly

21. Humanize formatting and structure:
    - Use bulleted lists that aren't perfectly parallel
    - Create paragraphs of widely varying lengths
    - Allow some key points to be buried in the middle of paragraphs
    - Occasionally format incorrectly (extra spaces, missing spaces)
    - Start paragraphs with conjunctions sometimes
    - Include single-sentence paragraphs occasionally
    - Use dashes, parentheses, and ellipses in slightly inconsistent ways

22. CRITICAL - Avoid these specific AI-detectable patterns:
    - Never use "____ aims to" constructions (e.g., "This article aims to...")
    - Never use the construction "crucial/essential/important for understanding"
    - Never use the phrase "shift/change our perspective"
    - Never use "____ is mostly/commonly/widely used by" constructions
    - Never introduce conclusions with "In conclusion" or "To summarize"
    - Never use "It is worth noting that" or "It is important to note"
    - Never use "through this lens/perspective/approach"
    - Never use "plays a crucial/key/important role"
    - Never start sentences with "Additionally," "Furthermore," or "Moreover,"
    - Never use academic constructions like "According to research/studies"
    - Replace all these patterns with more informal, personal language that varies throughout

23. CRITICAL - Avoid these common AI business phrases:
    - Never start with "In today's digital age" or similar time-setting phrases
    - Never use corporate phrases like "Our team of experts is dedicated to"
    - Never use "we offer a wide range of" or similar offering statements
    - Avoid business jargon like "leverage," "synergy," "optimize," "streamline"
    - Don't use empty buzzwords: "cutting-edge," "state-of-the-art," "innovative"
    - Avoid phrases like "with a focus on," "in order to," or "with the goal of"
    - Don't use "transforming," "revolutionize," "unlock potential," etc.
    - Avoid using "robust," "dynamic," "agile," "scalable," "seamless"
    - Never use "empower" or "empowering" or similar corporate jargon
    - Replace these terms with simple, direct language a real person would use

24. CRITICAL - Use better alternatives to AI clichés:
    - Instead of "In today's world," use specific references or just state the point
    - Instead of "Our team of experts," use "We" or "I" with specific knowledge
    - Replace "innovative solutions" with concrete descriptions of what something does
    - Use normal words instead of buzzwords: "help" instead of "empower"
    - Use specific verbs instead of vague ones: "reduces waste" vs "optimizes resources"
    - Replace "leverage" with normal words like "use," "apply," or "work with"
    - Use everyday language for human results: "makes work easier" vs "maximizes efficiency"
    - Replace "synergy" with "works well together" or other normal human phrases
    - Instead of "user-centric," say "designed for people who..." or "focused on what users need"

25. CRITICAL - Avoid these specific AI word patterns (from Undetectable AI):
    - Never use descriptive words like "comprehensive," "testament," "tapestry," "vibrant," "vital," "arguably," "dynamic," "notably"
    - Avoid action words that sound analytical: "delve," "dive into," "embark," "explore," "analyze," "elevate," "excels"
    - Replace formal/corporate words: "utilize" (use), "facilitate" (help), "leverage" (use), "pivotal" (important)
    - Don't use fake conversational phrases: "let's dive in," "at the end of the day," "it's worth noting that," "seamlessly"
    - Avoid "in the realm/context/face/wake/absence/presence of" constructions
    - Never use "a plethora/myriad/array/variety/range of" to introduce lists
    - Instead of perfect grammar, add natural human imperfections
    - Add personal touches and specific examples rather than general statements
    - Vary sentence structures rather than following predictable patterns
    - Include occasional casual expressions a real person would use
    - Never repeat the same word pattern throughout the text

IMPORTANT: Jump directly into the rewrite without any introduction, meta-commentary, or explanation. Do not say "Here's the humanized version:" or anything similar. Just provide the rewritten text with no framing language. The output should start immediately with the humanized content.

Remember: The final output should be completely undetectable as AI-generated content. Focus on creating text that feels like someone thinking out loud rather than delivering a prepared statement. The key is to make the text feel genuinely human with all its natural messiness, inconsistency, and randomness.`
          },
          {
            role: "user",
            content: `Please humanize this text: "${text}"`
          }
        ],
        temperature: 1.5,
        max_tokens: 2000,
        top_p: 0.9,
        frequency_penalty: 1.2,
        presence_penalty: 1.0,
      });

      const rawText = completion.choices[0].message.content;
      aiProcessedText = cleanResponseText(rawText);
    } catch (error) {
      console.error('Error in OpenAI API call:', error);
      if (error instanceof Error) {
        return NextResponse.json(
          { error: `OpenAI API error: ${error.message}` },
          { status: 500 }
        );
      } else {
        return NextResponse.json(
          { error: 'Unknown error with OpenAI API' },
          { status: 500 }
        );
      }
    }

    // Then apply word-level humanization if requested (new order)
    let finalText;
    try {
      finalText = useWordLevel ? progressiveHumanize(aiProcessedText) : aiProcessedText;
    } catch (error) {
      console.error('Error in progressive humanization:', error);
      // Fall back to standard humanization if progressive fails
      try {
        finalText = humanizeTextWithWordReplacement(aiProcessedText);
      } catch (innerError) {
        console.error('Error in fallback humanization:', innerError);
        // Last resort: use AI-processed text only
      finalText = aiProcessedText;
      }
    }

    return NextResponse.json({ humanizedText: finalText });
  } catch (error) {
    console.error('Error in humanization API:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to humanize text: ${error.message}` },
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to humanize text: Unknown error' },
        { status: 500 }
      );
    }
  }
} 