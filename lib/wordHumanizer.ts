// Word-level text humanizer inspired by ZAYUVALYA/AI-Text-Humanizer
// This approach replaces words with contextually appropriate synonyms and adds sentence-level variety

// Import the extended synonyms database
import { extendedSynonymsDatabase } from './extendedSynonyms';

// Types for humanization options
export type HumanizationLevel = 'light' | 'moderate' | 'heavy' | 'undetectable';
export type WritingStyle = 'casual' | 'academic' | 'professional';

export interface HumanizationOptions {
  level: HumanizationLevel;
  style: WritingStyle;
  preserveCitations?: boolean;
  preserveTechnicalTerms?: boolean;
  allowTypos?: boolean;
  allowContractions?: boolean;
  allowSlang?: boolean;
  allowSentenceRestructuring?: boolean;
  inconsistencyLevel?: number; // 0-100 scale for how inconsistent to be
}

// Default options
export const defaultOptions: HumanizationOptions = {
  level: 'undetectable',
  style: 'professional',
  preserveCitations: true,
  preserveTechnicalTerms: true,
  allowTypos: true,
  allowContractions: true,
  allowSlang: true,
  allowSentenceRestructuring: true,
  inconsistencyLevel: 80 // High inconsistency for more natural text
};

// Common English word synonyms - these take precedence over the full dictionary
const synonyms: Record<string, string[]> = {
  // Common formal to casual word replacements
  "additionally": ["also", "plus", "besides", "furthermore", "moreover", "on top of that"],
  "approximately": ["about", "around", "roughly", "nearly", "almost", "close to"],
  "assist": ["help", "aid", "support", "back", "lend a hand"],
  "attempt": ["try", "strive", "seek", "aim", "give it a shot", "take a stab at"],
  "communicate": ["talk", "speak", "chat", "tell", "get in touch", "reach out"],
  "compensate": ["pay", "reward", "reimburse", "make up for"],
  "comprehend": ["understand", "get", "grasp", "follow", "figure out", "see what you mean"],
  "concerning": ["about", "regarding", "on", "related to", "with regard to"],
  "consequently": ["so", "thus", "therefore", "hence", "as a result", "that's why"],
  "construct": ["build", "make", "create", "form", "put together"],
  "demonstrate": ["show", "prove", "display", "exhibit", "make clear"],
  "determine": ["find out", "check", "decide", "figure out", "work out"],
  "discover": ["find", "learn", "realize", "see", "stumble upon", "come across"],
  "discuss": ["talk about", "go over", "chat about", "bring up", "touch on"],
  "elaborate": ["explain", "detail", "describe", "spell out", "get into the details"],
  "encounter": ["meet", "face", "find", "run into", "come up against"],
  "endeavor": ["try", "attempt", "strive", "work at", "do your best"],
  "examine": ["look at", "check", "study", "inspect", "take a look at"],
  "excessive": ["too much", "extreme", "extra", "over the top", "way too much"],
  "facilitate": ["help", "aid", "assist", "enable", "make easier"],
  "frequently": ["often", "regularly", "commonly", "usually", "time and again"],
  "fundamental": ["basic", "key", "main", "core", "essential"],
  "generate": ["make", "create", "produce", "develop", "come up with"],
  "however": ["but", "still", "yet", "though", "even so", "that said"],
  "illustrate": ["show", "explain", "demonstrate", "depict", "make clear"],
  "implement": ["carry out", "do", "use", "apply", "put in place", "roll out"],
  "indicate": ["show", "point to", "suggest", "signal", "hint at"],
  "inquire": ["ask", "question", "query", "wonder", "want to know"],
  "maintain": ["keep", "uphold", "preserve", "continue", "keep going"],
  "methodology": ["method", "way", "approach", "process", "how-to"],
  "modify": ["change", "alter", "adjust", "tweak", "switch up"],
  "monitor": ["watch", "check", "track", "observe", "keep an eye on"],
  "numerous": ["many", "lots of", "several", "plenty", "a bunch of", "tons of"],
  "observe": ["see", "notice", "spot", "watch", "catch", "pick up on"],
  "obtain": ["get", "acquire", "gain", "secure", "pick up", "grab"],
  "optimize": ["improve", "enhance", "perfect", "fine-tune", "make better"],
  "option": ["choice", "pick", "selection", "alternative", "way to go"],
  "perceive": ["see", "view", "regard", "think of", "look at", "take"],
  "perform": ["do", "carry out", "execute", "conduct", "pull off"],
  "potentially": ["maybe", "perhaps", "possibly", "could", "might", "could be"],
  "previous": ["earlier", "prior", "before", "last", "old", "former"],
  "primarily": ["mainly", "mostly", "chiefly", "largely", "for the most part"],
  "prioritize": ["focus on", "put first", "highlight", "zero in on"],
  "procedure": ["process", "method", "way", "steps", "how it's done"],
  "provide": ["give", "offer", "supply", "deliver", "hook up with"],
  "purchase": ["buy", "get", "acquire", "pick up", "shell out for"],
  "receive": ["get", "obtain", "acquire", "collect", "be given"],
  "recommend": ["suggest", "advise", "propose", "vouch for"],
  "reduce": ["cut", "lower", "decrease", "lessen", "bring down"],
  "regarding": ["about", "concerning", "on", "with respect to"],
  "request": ["ask for", "seek", "want", "put in for"],
  "require": ["need", "want", "call for", "demand", "have to have"],
  "resolve": ["solve", "fix", "settle", "deal with", "sort out"],
  "select": ["choose", "pick", "opt for", "go with", "go for"],
  "significantly": ["greatly", "hugely", "a lot", "much", "way more"],
  "subsequently": ["later", "after", "next", "then", "afterward"],
  "sufficient": ["enough", "ample", "adequate", "plenty", "good enough"],
  "suggest": ["propose", "recommend", "advise", "hint", "bring up"],
  "therefore": ["so", "thus", "hence", "that's why", "as a result"],
  "typically": ["usually", "normally", "generally", "commonly", "most of the time"],
  "ultimate": ["final", "last", "best", "greatest", "top", "number one"],
  "utilize": ["use", "apply", "employ", "work with", "make use of"],
  "validate": ["confirm", "verify", "prove", "check", "back up"],
  "valuable": ["useful", "helpful", "worthwhile", "good", "great"],
  "variety": ["range", "mix", "selection", "assortment", "bunch"],
  "various": ["different", "several", "many", "diverse", "all sorts of"],
  "visualize": ["picture", "imagine", "see", "envision", "think of"],
  
  // Common verbs - add everyday casual alternatives
  "speak": ["talk", "chat", "say", "tell", "go on about"],
  "walk": ["go", "head", "move", "stroll", "wander"],
  "look": ["see", "check", "peek", "glance", "spot"],
  "think": ["reckon", "guess", "figure", "suppose", "wonder"],
  "believe": ["think", "feel", "reckon", "guess", "suspect"],
  "know": ["get", "understand", "see", "realize", "tell"],
  "say": ["tell", "mention", "point out", "bring up", "talk about"],
  "find": ["discover", "come across", "spot", "notice", "see"],
  
  // Common adjectives
  "good": ["great", "awesome", "nice", "excellent", "fantastic", "cool", "sweet", "solid"],
  "bad": ["poor", "awful", "terrible", "horrible", "lousy", "not great", "rough"],
  "big": ["large", "huge", "massive", "enormous", "gigantic", "major"],
  "small": ["little", "tiny", "miniature", "compact", "petite", "minor"],
  "happy": ["glad", "joyful", "pleased", "cheerful", "thrilled", "stoked", "psyched"],
  "sad": ["unhappy", "upset", "down", "gloomy", "blue", "bummed", "not thrilled"],
  "interesting": ["engaging", "fascinating", "captivating", "intriguing", "cool", "neat"],
  "boring": ["dull", "tedious", "monotonous", "bland", "dry", "meh", "lame"],
  "beautiful": ["pretty", "gorgeous", "attractive", "stunning", "lovely", "hot"],
  "ugly": ["unattractive", "hideous", "unsightly", "plain", "rough"],
  "important": ["crucial", "vital", "essential", "key", "critical", "big deal"],
  "difficult": ["hard", "tough", "challenging", "complex", "complicated", "tricky"],
  "easy": ["simple", "straightforward", "effortless", "uncomplicated", "no sweat"],
  
  // Transition words/phrases to make flow more natural
  "firstly": ["first", "to start with", "first off", "to begin with"],
  "secondly": ["second", "next", "then", "after that"],
  "finally": ["lastly", "in the end", "to wrap up", "to finish"],
  "in conclusion": ["to sum up", "all in all", "bottom line", "when it comes down to it"],
  "for example": ["like", "for instance", "say", "take"],
  "in other words": ["that is", "basically", "simply put", "to put it another way"],
  "specifically": ["namely", "particularly", "especially", "in particular"],
  "in addition": ["also", "plus", "on top of that", "besides", "what's more"],
  "meanwhile": ["at the same time", "during this", "while this happens"],
  "nevertheless": ["still", "however", "even so", "that said", "but", "though"],
  
  // Additional extended commonly used words
  "a bit": ["a trifle", "a little"],
  "a couple of": ["few", "a few"],
  "a few": ["few", "a couple of"],
  "a great deal": ["a lot", "very much", "a good deal", "much", "often"],
  "a lot": ["very much", "much", "a good deal", "a great deal"],
  "abandon": ["forsake", "desert", "give up", "vacate", "empty"],
  "ability": ["capacity", "capability", "talent", "skill", "aptitude", "faculty", "power"],
  "able": ["capable", "competent", "qualified", "skilled", "adept"],
  "about": ["approximately", "around", "nearly", "close to", "roughly", "generally", "more or less"],
  "above": ["over", "on top of", "higher than", "beyond", "exceeding", "upwards of"],
  "absolute": ["complete", "total", "utter", "outright", "downright"],
  "absolutely": ["completely", "totally", "entirely", "fully", "wholly"],
  "abundant": ["plentiful", "copious", "ample", "numerous", "plenty"],
  "accept": ["acknowledge", "admit", "agree to", "consent to", "take on"],
  "acceptable": ["satisfactory", "adequate", "passable", "tolerable", "fine"],
  "access": ["entry", "admission", "entrance", "means of approach", "opportunity", "right of entry"],
  "accessible": ["available", "obtainable", "attainable", "reachable", "handy"],
  "accident": ["mishap", "incident", "crash", "collision", "misfortune", "casualty"],
  "accomplish": ["achieve", "complete", "fulfill", "perform", "execute", "realize", "attain"],
  "according to": ["as stated by", "as reported by", "based on", "in line with", "following"],
  "account": ["explanation", "report", "description", "narrative", "version"],
  "accurate": ["precise", "exact", "correct", "right", "true", "errorless", "faithful"],
  "achieve": ["accomplish", "attain", "reach", "realize", "fulfill", "complete", "execute"],
  "achievement": ["accomplishment", "attainment", "success", "triumph", "feat"],
  "acknowledge": ["admit", "recognize", "accept", "concede", "confess", "grant", "own"],
  "acquire": ["get", "obtain", "gain", "earn", "secure", "procure", "come by"],
  "across": ["over", "through", "throughout", "beyond", "from one side to the other"],
  "action": ["act", "deed", "move", "operation", "performance"],
  "active": ["energetic", "dynamic", "lively", "busy", "vigorous"],
  "actual": ["real", "true", "factual", "genuine", "authentic"],
  "actually": ["in fact", "really", "truly", "indeed", "as a matter of fact"],
  "add": ["include", "append", "attach", "affix", "insert", "incorporate", "supplement"],
  "addition": ["increase", "extension", "supplement", "extra", "addendum"],
  "additional": ["extra", "more", "further", "supplementary", "added"],
  "address": ["discuss", "deal with", "cover", "handle", "manage", "speak to", "refer to"],
  "adequate": ["sufficient", "enough", "suitable", "appropriate", "satisfactory", "ample", "acceptable"],
  "adjust": ["adapt", "modify", "alter", "change", "regulate"],
  "admire": ["respect", "esteem", "look up to", "appreciate", "regard highly"],
  "admit": ["acknowledge", "confess", "concede", "grant", "accept"],
  "adopt": ["take on", "take up", "embrace", "accept", "acquire"],
  "advance": ["progress", "move forward", "proceed", "develop", "improve"],
  "advantage": ["benefit", "edge", "profit", "gain", "upper hand", "privilege", "asset"],
  "adventure": ["exploit", "escapade", "journey", "experience", "undertaking"],
  "advice": ["recommendation", "suggestion", "guidance", "counsel", "opinion", "tip", "input"],
  "affect": ["influence", "impact", "alter", "change", "modify"],
  "afraid": ["scared", "frightened", "fearful", "terrified", "anxious"],
  "after": ["following", "subsequent to", "later than", "behind", "beyond"],
  "afternoon": ["midday", "post-meridiem", "p.m.", "after lunch", "post-noon"],
  "again": ["once more", "anew", "afresh", "another time", "repeatedly"],
  "against": ["opposed to", "contrary to", "anti", "versus", "counter to"],
  "age": ["era", "period", "time", "epoch", "years"],
  "agency": ["organization", "bureau", "office", "department", "firm"],
  "agenda": ["schedule", "program", "timetable", "plan", "lineup"],
  "aggressive": ["hostile", "combative", "belligerent", "antagonistic", "forceful"],
  "ago": ["in the past", "previously", "before now", "earlier", "formerly"],
  "agree": ["concur", "consent", "comply", "go along with", "accede"],
  "agreement": ["accord", "harmony", "consensus", "understanding", "arrangement"],
  "ahead": ["in front", "forward", "before", "in advance", "onwards"],
  "aid": ["help", "assist", "support", "facilitate", "back"],
  "aim": ["goal", "purpose", "intention", "target", "objective"],
  "air": ["atmosphere", "ambiance", "environment", "quality", "feel"],
  "alarm": ["alert", "warning", "signal", "siren", "notification"],
  "albeit": ["although", "even though", "despite the fact", "notwithstanding", "though"],
  "alert": ["warning", "notice", "signal", "notification", "advisory"],
  "alive": ["living", "breathing", "animated", "vital", "active"],
  "all": ["every", "the whole", "entire", "complete", "total"],
  "allow": ["permit", "let", "enable", "authorize", "sanction"],
  "almost": ["nearly", "just about", "all but", "not quite", "close to"],
  "alone": ["solitary", "by oneself", "solo", "unaccompanied", "isolated"],
  "along": ["alongside", "beside", "next to", "with", "together with"],
  "already": ["previously", "by now", "before", "formerly", "hitherto"],
  "also": ["too", "as well", "in addition", "besides", "moreover"],
  "although": ["though", "even though", "in spite of", "despite", "albeit"],
  "always": ["forever", "continually", "constantly", "invariably", "perpetually"],
  "amazing": ["astonishing", "astounding", "surprising", "wonderful", "incredible"],
  "amount": ["quantity", "volume", "sum", "total", "portion"]
};

// Store for extended synonyms from external source - now filled with the complete database
let extendedSynonyms: Record<string, string[]> = extendedSynonymsDatabase;

// Academic-specific synonyms for formal writing
const academicSynonyms: Record<string, string[]> = {
  // ... existing academic synonyms ...
};

// Function to load additional extended synonyms if needed
export function loadExtendedSynonyms(data: Record<string, string[]>): void {
  // Merge the provided data with our existing extended synonyms
  Object.assign(extendedSynonyms, data);
  console.log(`Extended synonyms database now contains ${Object.keys(extendedSynonyms).length} entries`);
}

// Words that should not be modified (stopwords)
const stopWords = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", 
  "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being", 
  "below", "between", "both", "but", "by", "can", "can't", "cannot", "could", 
  "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", 
  "during", "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", 
  "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", 
  "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", 
  "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself", "let's", "me", 
  "more", "most", "mustn't", "my", "myself", "no", "nor", "not", "of", "off", "on", "once", 
  "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", 
  "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such", 
  "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there", 
  "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", 
  "through", "to", "too", "under", "until", "up", "very", "was", "wasn't", "we", "we'd", 
  "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's", "where", 
  "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't", 
  "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves"
]);

// Terms that should never be replaced
const fixedTerms = new Set([
  "name", "email", "phone", "address", "website", "company",
  "date", "time", "year", "month", "day", 
  "january", "february", "march", "april", "may", "june", "july", 
  "august", "september", "october", "november", "december",
  "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
  "north", "south", "east", "west", 
  "usa", "uk", "eu", "usd", "eur", "gbp",
  // Academic terms
  "et al", "fig", "e.g", "i.e", "cf", "ibid", "op cit", "viz", 
  "hypothesis", "theory", "methodology", "data", "analysis", "citation",
  "references", "bibliography", "abstract", "conclusion", "introduction",
  "results", "discussion", "journal", "volume", "issue", "doi", "isbn",
  "dissertation", "thesis", "appendix", "preface", "postscript"
]);

// Citation patterns to preserve
const citationPatterns = [
  /\(\w+,\s+\d{4}\)/g,               // (Smith, 2020)
  /\(\w+\s+et\s+al\.,\s+\d{4}\)/g,   // (Smith et al., 2020)
  /\[\d+\]/g,                        // [1]
  /\(\d+\)/g,                        // (1)
  /\w+\s+\(\d{4}\)/g,                // Smith (2020)
  /\w+\s+et\s+al\.\s+\(\d{4}\)/g     // Smith et al. (2020)
];

// Technical/scientific terms to preserve
const technicalTermPatterns = [
  /[A-Z][a-z]*\s+[a-z]+(?:us|is|um|ae|i|a|idae|aceae)$/g,  // Latin scientific names
  /p(?:\s+)?(?:<|>|=|≤|≥)\s+0\.\d+/g,  // p-values
  /\d+(?:\.\d+)?\s*(?:mm|cm|m|km|in|ft|yd|mi|g|kg|mg|ml|L|°C|°F|Hz|kHz|MHz|mol|mM|μM|nM|Pa|kPa|MPa|V|kV|mV|μV|A|mA|μA|W|kW|MW|GW|TW|s|min|h|d|wk|mo|yr)/g,  // Measurements with units
  /(?:Fig|Table|Eq)\.?\s+\d+/gi,  // Figure/Table/Equation references
  /[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)*(?=\s|$|[.,;:])/g  // Acronyms
];

// Sentence starters to add variety
const sentenceStarters = [
  "Honestly, ", "Basically, ", "Look, ", "See, ", "Y'know, ", 
  "I mean, ", "So, ", "Well, ", "Like, ", "Okay so ", "Right, ",
  "Actually, ", "Seriously, ", "Truth is, ", "TBH, ", "Frankly, ",
  "To be fair, ", "Gotta say, ", "Let me tell you, ", "No joke, "
];

// Academic sentence starters
const academicSentenceStarters = [
  "Notably, ", "Importantly, ", "Interestingly, ", "Significantly, ", 
  "Evidently, ", "Research suggests that ", "Studies indicate that ", 
  "It is worth noting that ", "According to the data, ", "Empirically, ",
  "As observed, ", "Analysis reveals that ", "Recent findings suggest ", 
  "Given these points, ", "In this context, ", "Considering this evidence, ",
  "Results demonstrate that ", "As illustrated by this research, "
];

// Mid-sentence filler words/phrases
const fillerPhrases = [
  "like", "you know", "kind of", "sort of", "basically", "literally",
  "I mean", "actually", "to be honest", "honestly", "pretty much",
  "more or less", "in a way", "for what it's worth", "as far as I can tell"
];

// Academic mid-sentence phrases
const academicFillerPhrases = [
  "in this context", "in particular", "specifically", "to clarify", 
  "to elaborate", "in essence", "fundamentally", "in principle", 
  "theoretically", "empirically", "to a certain extent", "broadly speaking",
  "within this framework", "from this perspective", "given these factors",
  "in light of this evidence", "as demonstrated by", "notably"
];

// Sentence enders to add variety
const sentenceEnders = [
  " right?", " you know?", " I think.", " I guess.", " though.", 
  " for sure.", " no doubt.", " obviously.", " haha.", " lol.", 
  " no cap.", " for real.", " IMO.", " that's for sure."
];

// Academic sentence enders
const academicSentenceEnders = [
  " as expected.", " as hypothesized.", " as theorized.", 
  " based on available evidence.", " with statistical significance.",
  " in accordance with previous findings.", " which warrants further investigation.",
  " despite certain limitations.", " as demonstrated in this study.", 
  " confirming earlier research."
];

// Check if text contains a citation pattern
function containsCitation(text: string): boolean {
  return citationPatterns.some(pattern => pattern.test(text));
}

// Check if text contains a technical term pattern
function containsTechnicalTerm(text: string): boolean {
  return technicalTermPatterns.some(pattern => pattern.test(text));
}

// Check if a word is a stop word that shouldn't be modified
function isStopWord(word: string): boolean {
  return stopWords.has(word.toLowerCase());
}

// Check if a word is a fixed term that shouldn't be modified
function isFixedTerm(word: string): boolean {
  return fixedTerms.has(word.toLowerCase());
}

// Check if a word is a proper noun (capitalized)
function isProperNoun(word: string): boolean {
  return /^[A-Z][a-z]*$/.test(word);
}

// Get synonyms from all available sources based on style
function getSynonyms(word: string, options: HumanizationOptions): string[] | undefined {
  const lowerCaseWord = word.toLowerCase();
  
  // Try to get synonyms from the appropriate source based on style
  if (options.style === 'academic' && academicSynonyms[lowerCaseWord]) {
    return academicSynonyms[lowerCaseWord];
  }
  
  // Check built-in synonyms first as they're hand-curated
  if (synonyms[lowerCaseWord]) {
    return synonyms[lowerCaseWord];
  }
  
  // Check extended synonyms from GitHub repository
  if (extendedSynonyms[lowerCaseWord]) {
    return extendedSynonyms[lowerCaseWord];
  }
  
  return undefined;
}

// Replace a word with its synonym if available
function replaceWord(word: string, options: HumanizationOptions): string {
  const lowerCaseWord = word.toLowerCase();
  
  // Don't replace stop words, fixed terms, or proper nouns
  if (isStopWord(lowerCaseWord) || isFixedTerm(lowerCaseWord) || isProperNoun(word)) {
    return word;
  }
  
  // Add random contractions for common words if allowed
  if (options.allowContractions && Math.random() < 0.3) {
    if (lowerCaseWord === "it is") return "it's";
    if (lowerCaseWord === "they are") return "they're";
    if (lowerCaseWord === "we are") return "we're";
    if (lowerCaseWord === "you are") return "you're";
    if (lowerCaseWord === "i am") return "I'm";
    if (lowerCaseWord === "do not") return "don't";
    if (lowerCaseWord === "cannot") return "can't";
    if (lowerCaseWord === "will not") return "won't";
    if (lowerCaseWord === "should not") return "shouldn't";
  }
  
  // Get appropriate synonyms
  const wordSynonyms = getSynonyms(word, options);
    
  if (wordSynonyms && wordSynonyms.length > 0) {
    // Use weighted random selection to prefer more natural alternatives
    const level = options.level;
    
    // Adjust randomness based on humanization level
    // Light: Less likely to change words
    // Heavy: More likely to change words and select from further in the list
    let randomFactor;
    switch (level) {
      case 'light':
        randomFactor = Math.pow(Math.random(), 1.8); // Strong preference for earlier words
        break;
      case 'heavy':
        randomFactor = Math.pow(Math.random(), 0.7); // More uniform distribution
        break;
      case 'moderate':
      default:
        randomFactor = Math.pow(Math.random(), 1.2); // Default behavior
        break;
    }
    
    const index = Math.floor(randomFactor * wordSynonyms.length);
    const synonym = wordSynonyms[index];
    
    // Preserve capitalization
    if (word[0] === word[0].toUpperCase()) {
      return synonym.charAt(0).toUpperCase() + synonym.slice(1);
    }
    
    return synonym;
  }
  
  // Return original word if no synonym is found
  return word;
}

// Function to get appropriate sentence starters, fillers, and enders based on style with more variability
function getTextElements(options: HumanizationOptions) {
  // Get appropriate elements based on style and add randomness
  const starters = options.style === 'academic' ? academicSentenceStarters : sentenceStarters;
  const fillers = options.style === 'academic' ? academicFillerPhrases : fillerPhrases;
  const enders = options.style === 'academic' ? academicSentenceEnders : sentenceEnders;
  
  // For undetectable level, blend some elements between styles for more natural variation
  if (options.level === 'undetectable') {
    const blendedStarters = [...starters];
    const blendedFillers = [...fillers];
    const blendedEnders = [...enders];
    
    // Add some elements from other styles (5-10 random ones)
    const otherStarters = options.style === 'academic' ? sentenceStarters : academicSentenceStarters;
    const otherFillers = options.style === 'academic' ? fillerPhrases : academicFillerPhrases;
    const otherEnders = options.style === 'academic' ? sentenceEnders : academicSentenceEnders;
    
    // Take 5-10 random elements from each
    const randomElements = (arr: string[], count: number) => {
      const shuffled = [...arr].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    };
    
    blendedStarters.push(...randomElements(otherStarters, 5 + Math.floor(Math.random() * 5)));
    blendedFillers.push(...randomElements(otherFillers, 5 + Math.floor(Math.random() * 5)));
    blendedEnders.push(...randomElements(otherEnders, 5 + Math.floor(Math.random() * 5)));
    
    return { starters: blendedStarters, fillers: blendedFillers, enders: blendedEnders };
  }
  
  return { starters, fillers, enders };
}

// Enhanced function for adding more variety in typos
function addNaturalTypos(text: string, options: HumanizationOptions): string {
  // Only add typos if allowed and with appropriate probability based on level
  if (!options.allowTypos) return text;
  
  let typoProbability;
  switch (options.level) {
    case 'light':
      typoProbability = 0.008; // 0.8% chance per paragraph
      break;
    case 'heavy':
      typoProbability = 0.035; // 3.5% chance per paragraph  
      break;
    case 'undetectable':
      typoProbability = 0.05; // 5% chance per paragraph - like real humans with less careful proofreading
      break;
    case 'moderate':
    default:
      typoProbability = 0.02; // 2% chance per paragraph
      break;
  }
  
  if (Math.random() > typoProbability) return text;
  
  // Enhanced typo patterns with more realistic human errors
  const typoPatterns = [
    // Character swaps (e.g., "teh" instead of "the")
    (t: string) => {
      const words = t.split(' ');
      if (words.length < 3) return t;
      
      // Find a word longer than 3 chars to modify
      const eligibleWords = words.filter(w => w.length > 3);
      if (eligibleWords.length === 0) return t;
      
      const wordToModify = eligibleWords[Math.floor(Math.random() * eligibleWords.length)];
      const wordIndex = words.indexOf(wordToModify);
      
      // Choose a position to swap
      const pos = 1 + Math.floor(Math.random() * (wordToModify.length - 2));
      const swapped = wordToModify.substring(0, pos - 1) + 
                      wordToModify[pos] + 
                      wordToModify[pos - 1] + 
                      wordToModify.substring(pos + 1);
      
      words[wordIndex] = swapped;
      return words.join(' ');
    },
    
    // Missing letter (e.g., "tha" instead of "that")
    (t: string) => {
      const words = t.split(' ');
      if (words.length < 3) return t;
      
      const eligibleWords = words.filter(w => w.length > 4);
      if (eligibleWords.length === 0) return t;
      
      const wordToModify = eligibleWords[Math.floor(Math.random() * eligibleWords.length)];
      const wordIndex = words.indexOf(wordToModify);
      
      // Choose a position to remove (not first or last letter)
      const pos = 1 + Math.floor(Math.random() * (wordToModify.length - 2));
      const modified = wordToModify.substring(0, pos) + wordToModify.substring(pos + 1);
      
      words[wordIndex] = modified;
      return words.join(' ');
    },
    
    // Double letter (e.g., "thaat" instead of "that")
    (t: string) => {
      const words = t.split(' ');
      if (words.length < 3) return t;
      
      const eligibleWords = words.filter(w => w.length > 3);
      if (eligibleWords.length === 0) return t;
      
      const wordToModify = eligibleWords[Math.floor(Math.random() * eligibleWords.length)];
      const wordIndex = words.indexOf(wordToModify);
      
      // Choose a position to duplicate
      const pos = Math.floor(Math.random() * wordToModify.length);
      const modified = wordToModify.substring(0, pos) + 
                       wordToModify[pos] + 
                       wordToModify.substring(pos);
      
      words[wordIndex] = modified;
      return words.join(' ');
    },
    
    // Missed space (e.g., "andthe" instead of "and the")
    (t: string) => {
      const words = t.split(' ');
      if (words.length < 4) return t;
      
      // Choose random adjacent words
      const index = 1 + Math.floor(Math.random() * (words.length - 2));
      
      // Don't join if either word is too long
      if (words[index].length + words[index+1].length > 12) return t;
      
      // Join words by removing space
      const joined = words[index] + words[index+1];
      words.splice(index, 2, joined);
      
      return words.join(' ');
    },
    
    // Extra space in word (e.g., "rea lly" instead of "really")
    (t: string) => {
      const words = t.split(' ');
      if (words.length < 3) return t;
      
      const eligibleWords = words.filter(w => w.length > 5);
      if (eligibleWords.length === 0) return t;
      
      const wordToModify = eligibleWords[Math.floor(Math.random() * eligibleWords.length)];
      const wordIndex = words.indexOf(wordToModify);
      
      // Insert space somewhere in middle
      const pos = 2 + Math.floor(Math.random() * (wordToModify.length - 3));
      const modified = wordToModify.substring(0, pos) + ' ' + wordToModify.substring(pos);
      
      words[wordIndex] = modified;
      return words.join(' ');
    },
    
    // Wrong but similar letter (e.g., "tge" instead of "the")
    (t: string) => {
      const words = t.split(' ');
      if (words.length < 3) return t;
      
      const eligibleWords = words.filter(w => w.length > 4);
      if (eligibleWords.length === 0) return t;
      
      const wordToModify = eligibleWords[Math.floor(Math.random() * eligibleWords.length)];
      const wordIndex = words.indexOf(wordToModify);
      
      // Enhanced letter neighborhoods (similar keyboard positions and common typos)
      const neighbors: Record<string, string[]> = {
        'a': ['s', 'q', 'z', 'w', 'd'],
        'b': ['v', 'g', 'h', 'n', 'm'],
        'c': ['x', 'd', 'f', 'v', 's'],
        'd': ['s', 'e', 'r', 'f', 'c', 'x'],
        'e': ['w', 'r', 'd', 's', 'a'],
        'f': ['d', 'r', 't', 'g', 'v', 'c'],
        'g': ['f', 't', 'y', 'h', 'b', 'v'],
        'h': ['g', 'y', 'u', 'j', 'n', 'b'],
        'i': ['u', 'o', 'k', 'j', 'l'],
        'j': ['h', 'u', 'i', 'k', 'm', 'n'],
        'k': ['j', 'i', 'o', 'l', 'm'],
        'l': ['k', 'o', 'p', ';'],
        'm': ['n', 'j', 'k', ','],
        'n': ['b', 'h', 'j', 'm', ' '],
        'o': ['i', 'p', 'l', 'k', '0'],
        'p': ['o', 'l', ';', '['],
        'q': ['w', 'a', '1'],
        'r': ['e', 't', 'f', 'd', '4'],
        's': ['a', 'w', 'e', 'd', 'x', 'z'],
        't': ['r', 'y', 'g', 'f', '5'],
        'u': ['y', 'i', 'j', 'h', '7'],
        'v': ['c', 'f', 'g', 'b', ' '],
        'w': ['q', 'e', 's', 'a', '2'],
        'x': ['z', 's', 'd', 'c'],
        'y': ['t', 'u', 'h', 'g', '6'],
        'z': ['a', 's', 'x']
      };
      
      // Choose a position to modify (not first letter to keep recognizable)
      const pos = 1 + Math.floor(Math.random() * (wordToModify.length - 1));
      const letter = wordToModify[pos].toLowerCase();
      
      if (neighbors[letter]) {
        const replacement = neighbors[letter][Math.floor(Math.random() * neighbors[letter].length)];
        
        // Preserve case
        let replacementLetter = replacement;
        if (wordToModify[pos] === wordToModify[pos].toUpperCase()) {
          replacementLetter = replacement.toUpperCase();
        }
        
        const modified = wordToModify.substring(0, pos) + 
                         replacementLetter + 
                         wordToModify.substring(pos + 1);
        
        words[wordIndex] = modified;
      }
      
      return words.join(' ');
    },
    
    // Additional pattern: Autocorrect-style errors (common word replacements)
    (t: string) => {
      const commonErrors = [
        {wrong: "their", right: "there"},
        {wrong: "there", right: "their"},
        {wrong: "then", right: "than"},
        {wrong: "than", right: "then"},
        {wrong: "affect", right: "effect"},
        {wrong: "effect", right: "affect"},
        {wrong: "accept", right: "except"},
        {wrong: "except", right: "accept"},
        {wrong: "your", right: "you're"},
        {wrong: "you're", right: "your"},
        {wrong: "its", right: "it's"},
        {wrong: "it's", right: "its"},
        {wrong: "lose", right: "loose"},
        {wrong: "loose", right: "lose"},
        {wrong: "to", right: "too"},
        {wrong: "too", right: "to"},
        {wrong: "were", right: "where"},
        {wrong: "where", right: "were"},
        {wrong: "wont", right: "won't"},
        {wrong: "we're", right: "were"},
        {wrong: "they're", right: "their"},
        {wrong: "are", right: "our"},
        {wrong: "our", right: "are"},
        {wrong: "definitely", right: "defiantly"},
        {wrong: "defiantly", right: "definitely"},
        {wrong: "weather", right: "whether"},
        {wrong: "whether", right: "weather"},
        {wrong: "principal", right: "principle"},
        {wrong: "principle", right: "principal"},
        {wrong: "stationary", right: "stationery"},
        {wrong: "stationery", right: "stationary"},
        {wrong: "compliment", right: "complement"},
        {wrong: "complement", right: "compliment"},
        {wrong: "desert", right: "dessert"},
        {wrong: "dessert", right: "desert"},
        {wrong: "discreet", right: "discrete"},
        {wrong: "discrete", right: "discreet"},
        {wrong: "elicit", right: "illicit"},
        {wrong: "illicit", right: "elicit"},
        {wrong: "eminent", right: "imminent"},
        {wrong: "imminent", right: "eminent"},
        {wrong: "farther", right: "further"},
        {wrong: "further", right: "farther"},
        {wrong: "forego", right: "forgo"},
        {wrong: "forgo", right: "forego"},
        {wrong: "grisly", right: "grizzly"},
        {wrong: "grizzly", right: "grisly"},
        {wrong: "hoard", right: "horde"},
        {wrong: "horde", right: "hoard"},
        {wrong: "imply", right: "infer"},
        {wrong: "infer", right: "imply"},
        {wrong: "its", right: "it's"},
        {wrong: "it's", right: "its"},
        {wrong: "lay", right: "lie"},
        {wrong: "lie", right: "lay"},
        {wrong: "lead", right: "led"},
        {wrong: "led", right: "lead"},
        {wrong: "lessen", right: "lesson"},
        {wrong: "lesson", right: "lessen"},
        {wrong: "lightning", right: "lightening"},
        {wrong: "lightening", right: "lightning"},
        {wrong: "loose", right: "lose"},
        {wrong: "lose", right: "loose"},
        {wrong: "maybe", right: "may be"},
        {wrong: "may be", right: "maybe"},
        {wrong: "meat", right: "meet"},
        {wrong: "meet", right: "meat"},
        {wrong: "medal", right: "meddle"},
        {wrong: "meddle", right: "medal"},
        {wrong: "moot", right: "mute"},
        {wrong: "mute", right: "moot"},
        {wrong: "palate", right: "palette"},
        {wrong: "palette", right: "palate"},
        {wrong: "peace", right: "piece"},
        {wrong: "piece", right: "peace"},
        {wrong: "pedal", right: "peddle"},
        {wrong: "peddle", right: "pedal"},
        {wrong: "peer", right: "pier"},
        {wrong: "pier", right: "peer"},
        {wrong: "persecute", right: "prosecute"},
        {wrong: "prosecute", right: "persecute"},
        {wrong: "personal", right: "personnel"},
        {wrong: "personnel", right: "personal"},
        {wrong: "perspective", right: "prospective"},
        {wrong: "prospective", right: "perspective"},
        {wrong: "plain", right: "plane"},
        {wrong: "plane", right: "plain"},
        {wrong: "pole", right: "poll"},
        {wrong: "poll", right: "pole"},
        {wrong: "pour", right: "pore"},
        {wrong: "pore", right: "pour"},
        {wrong: "pray", right: "prey"},
        {wrong: "prey", right: "pray"},
        {wrong: "precede", right: "proceed"},
        {wrong: "proceed", right: "precede"},
        {wrong: "presence", right: "presents"},
        {wrong: "presents", right: "presence"},
        {wrong: "principal", right: "principle"},
        {wrong: "principle", right: "principal"},
        {wrong: "profit", right: "prophet"},
        {wrong: "prophet", right: "profit"},
        {wrong: "propose", right: "purpose"},
        {wrong: "purpose", right: "propose"},
        {wrong: "quiet", right: "quite"},
        {wrong: "quite", right: "quiet"},
        {wrong: "rain", right: "reign"},
        {wrong: "reign", right: "rain"},
        {wrong: "raise", right: "raze"},
        {wrong: "raze", right: "raise"},
        {wrong: "rational", right: "rationale"},
        {wrong: "rationale", right: "rational"},
        {wrong: "reluctant", right: "reticent"},
        {wrong: "reticent", right: "reluctant"},
        {wrong: "respectfully", right: "respectively"},
        {wrong: "respectively", right: "respectfully"},
        {wrong: "reverend", right: "reverent"},
        {wrong: "reverent", right: "reverend"},
        {wrong: "right", right: "rite"},
        {wrong: "rite", right: "right"},
        {wrong: "road", right: "rode"},
        {wrong: "rode", right: "road"},
        {wrong: "role", right: "roll"},
        {wrong: "roll", right: "role"},
        {wrong: "sail", right: "sale"},
        {wrong: "sale", right: "sail"},
        {wrong: "scene", right: "seen"},
        {wrong: "seen", right: "scene"},
        {wrong: "seam", right: "seem"},
        {wrong: "seem", right: "seam"},
        {wrong: "sew", right: "sow"},
        {wrong: "sow", right: "sew"},
        {wrong: "shear", right: "sheer"},
        {wrong: "sheer", right: "shear"},
        {wrong: "sight", right: "site"},
        {wrong: "site", right: "sight"},
        {wrong: "sleight", right: "slight"},
        {wrong: "slight", right: "sleight"},
        {wrong: "soar", right: "sore"},
        {wrong: "sore", right: "soar"},
        {wrong: "sole", right: "soul"},
        {wrong: "soul", right: "sole"},
        {wrong: "some", right: "sum"},
        {wrong: "sum", right: "some"},
        {wrong: "stake", right: "steak"},
        {wrong: "steak", right: "stake"},
        {wrong: "stationary", right: "stationery"},
        {wrong: "stationery", right: "stationary"},
        {wrong: "steal", right: "steel"},
        {wrong: "steel", right: "steal"},
        {wrong: "straight", right: "strait"},
        {wrong: "strait", right: "straight"},
        {wrong: "suite", right: "suit"},
        {wrong: "suit", right: "suite"},
        {wrong: "tail", right: "tale"},
        {wrong: "tale", right: "tail"},
        {wrong: "their", right: "there"},
        {wrong: "there", right: "their"},
        {wrong: "they're", right: "their"},
        {wrong: "their", right: "they're"},
        {wrong: "threw", right: "through"},
        {wrong: "through", right: "threw"},
        {wrong: "throne", right: "thrown"},
        {wrong: "thrown", right: "throne"},
        {wrong: "tide", right: "tied"},
        {wrong: "tied", right: "tide"},
        {wrong: "to", right: "too"},
        {wrong: "too", right: "to"},
        {wrong: "two", right: "to"},
        {wrong: "to", right: "two"},
        {wrong: "track", right: "tract"},
        {wrong: "tract", right: "track"},
        {wrong: "vain", right: "vane"},
        {wrong: "vane", right: "vain"},
        {wrong: "vein", right: "vain"},
        {wrong: "vain", right: "vein"},
        {wrong: "vary", right: "very"},
        {wrong: "very", right: "vary"},
        {wrong: "vice", right: "vise"},
        {wrong: "vise", right: "vice"},
        {wrong: "wail", right: "whale"},
        {wrong: "whale", right: "wail"},
        {wrong: "waist", right: "waste"},
        {wrong: "waste", right: "waist"},
        {wrong: "wait", right: "weight"},
        {wrong: "weight", right: "wait"},
        {wrong: "ware", right: "wear"},
        {wrong: "wear", right: "ware"},
        {wrong: "way", right: "weigh"},
        {wrong: "weigh", right: "way"},
        {wrong: "weak", right: "week"},
        {wrong: "week", right: "weak"},
        {wrong: "weather", right: "whether"},
        {wrong: "whether", right: "weather"},
        {wrong: "which", right: "witch"},
        {wrong: "witch", right: "which"},
        {wrong: "who's", right: "whose"},
        {wrong: "whose", right: "who's"},
        {wrong: "wood", right: "would"},
        {wrong: "would", right: "wood"},
        {wrong: "your", right: "you're"},
        {wrong: "you're", right: "your"},
        {wrong: "yore", right: "your"},
        {wrong: "your", right: "yore"}
      ];
      
      const words = t.split(' ');
      if (words.length < 5) return t;
      
      // Only proceed 30% of the time
      if (Math.random() > 0.3) return t;
      
      const error = commonErrors[Math.floor(Math.random() * commonErrors.length)];
      
      // Look for the correct word in the text
      const rightWordIndexes = words.reduce((indexes, word, i) => {
        if (word.toLowerCase() === error.right.toLowerCase()) indexes.push(i);
        return indexes;
      }, [] as number[]);
      
      // If we find the word, replace one instance with the wrong version 
      if (rightWordIndexes.length > 0) {
        const indexToReplace = rightWordIndexes[Math.floor(Math.random() * rightWordIndexes.length)];
        words[indexToReplace] = error.wrong;
        return words.join(' ');
      }
      
      return t;
    },
    
    // Phone autocorrect errors (common on mobile)
    (t: string) => {
      const autocorrectErrors = [
        {wrong: "duck", right: "fuck"},
        {wrong: "ducking", right: "fucking"},
        {wrong: "shot", right: "shit"},
        {wrong: "he'll", right: "hell"},
        {wrong: "we'll", right: "well"},
        {wrong: "were", right: "we're"},
        {wrong: "well", right: "we'll"},
        {wrong: "I'll", right: "ill"},
        {wrong: "cant", right: "can't"},
        {wrong: "wont", right: "won't"},
        {wrong: "dont", right: "don't"},
        {wrong: "Id", right: "I'd"},
        {wrong: "Ill", right: "I'll"},
        {wrong: "Im", right: "I'm"},
        {wrong: "aint", right: "ain't"},
        {wrong: "couldnt", right: "couldn't"},
        {wrong: "didnt", right: "didn't"},
        {wrong: "doesnt", right: "doesn't"},
        {wrong: "hadnt", right: "hadn't"},
        {wrong: "hasnt", right: "hasn't"},
        {wrong: "havent", right: "haven't"},
        {wrong: "isnt", right: "isn't"},
        {wrong: "mightnt", right: "mightn't"},
        {wrong: "mustnt", right: "mustn't"},
        {wrong: "neednt", right: "needn't"},
        {wrong: "oughtnt", right: "oughtn't"},
        {wrong: "shant", right: "shan't"},
        {wrong: "shouldnt", right: "shouldn't"},
        {wrong: "wasnt", right: "wasn't"},
        {wrong: "werent", right: "weren't"},
        {wrong: "wont", right: "won't"},
        {wrong: "wouldnt", right: "wouldn't"},
        {wrong: "youd", right: "you'd"},
        {wrong: "youll", right: "you'll"},
        {wrong: "youre", right: "you're"},
        {wrong: "youve", right: "you've"},
        {wrong: "youd", right: "you'd"},
        {wrong: "youll", right: "you'll"},
        {wrong: "youre", right: "you're"},
        {wrong: "youve", right: "you've"}
      ];
      
      // Only apply to casual style and rarely
      if (Math.random() > 0.2) return t;
      
      const words = t.split(' ');
      if (words.length < 5) return t;
      
      const error = autocorrectErrors[Math.floor(Math.random() * autocorrectErrors.length)];
      
      // Look for the correct word in the text
      const rightWordIndexes = words.reduce((indexes, word, i) => {
        if (word.toLowerCase() === error.right.toLowerCase()) indexes.push(i);
        return indexes;
      }, [] as number[]);
      
      // If we find the word, replace one instance with the wrong version 
      if (rightWordIndexes.length > 0) {
        const indexToReplace = rightWordIndexes[Math.floor(Math.random() * rightWordIndexes.length)];
        words[indexToReplace] = error.wrong;
        return words.join(' ');
      }
      
      return t;
    },

    // Capitalization errors
    (t: string) => {
      const words = t.split(' ');
      if (words.length < 5) return t;
  
      // Find a suitable word to change capitalization
      const eligibleWords = words.filter(w => w.length > 3 && !/^[0-9]/.test(w));
      if (eligibleWords.length === 0) return t;
      
      const wordToModify = eligibleWords[Math.floor(Math.random() * eligibleWords.length)];
      const wordIndex = words.indexOf(wordToModify);
      
      // Randomly change capitalization
      let modified;
      if (Math.random() < 0.5 && wordToModify[0] === wordToModify[0].toLowerCase()) {
        // Capitalize first letter
        modified = wordToModify[0].toUpperCase() + wordToModify.substring(1);
      } else if (wordToModify[0] === wordToModify[0].toUpperCase()) {
        // Lowercase first letter
        modified = wordToModify[0].toLowerCase() + wordToModify.substring(1);
      } else {
        // Random lowercase/uppercase in middle of word
        const pos = 1 + Math.floor(Math.random() * (wordToModify.length - 1));
        if (wordToModify[pos] === wordToModify[pos].toLowerCase()) {
          modified = wordToModify.substring(0, pos) + 
                    wordToModify[pos].toUpperCase() + 
                    wordToModify.substring(pos + 1);
        } else {
          modified = wordToModify.substring(0, pos) + 
                    wordToModify[pos].toLowerCase() + 
                    wordToModify.substring(pos + 1);
        }
      }
      
      words[wordIndex] = modified;
      return words.join(' ');
    },
    
    // Punctuation errors
    (t: string) => {
      // Common punctuation mistakes
      const punctuationErrors = [
        {from: ".", to: ","},
        {from: ",", to: ""},
        {from: "!", to: "."},
        {from: "?", to: "."},
        {from: ";", to: ","},
        {from: ":", to: ";"},
        {from: " ", to: "  "}, // Double space
        {from: ", ", to: ","},
        {from: ". ", to: "."},
        {from: "!", to: "!!"},
        {from: "?", to: "??"},
        {from: "...", to: "…"},
        {from: "…", to: "..."},
        {from: "--", to: "—"},
        {from: "—", to: "--"},
        {from: "(", to: "["},
        {from: ")", to: "]"},
        {from: "[", to: "("},
        {from: "]", to: ")"},
        {from: "'", to: '"'},
        {from: '"', to: "'"},
        {from: "&", to: "and"},
        {from: "and", to: "&"},
        {from: "+", to: "plus"},
        {from: "plus", to: "+"},
        {from: "=", to: "equals"},
        {from: "equals", to: "="},
        {from: "%", to: "percent"},
        {from: "percent", to: "%"},
        {from: "$", to: "dollars"},
        {from: "dollars", to: "$"},
        {from: "#", to: "number"},
        {from: "number", to: "#"},
        {from: "@", to: "at"},
        {from: "at", to: "@"},
        {from: "/", to: "or"},
        {from: "or", to: "/"},
        {from: "\\", to: "or"},
        {from: "or", to: "\\"},
        {from: "*", to: "times"},
        {from: "times", to: "*"},
        {from: "^", to: "to the power of"},
        {from: "to the power of", to: "^"},
        {from: "~", to: "approximately"},
        {from: "approximately", to: "~"},
        {from: "<", to: "less than"},
        {from: "less than", to: "<"},
        {from: ">", to: "greater than"},
        {from: "greater than", to: ">"},
        {from: "≤", to: "less than or equal to"},
        {from: "less than or equal to", to: "≤"},
        {from: "≥", to: "greater than or equal to"},
        {from: "greater than or equal to", to: "≥"},
        {from: "≠", to: "not equal to"},
        {from: "not equal to", to: "≠"},
        {from: "≈", to: "approximately equal to"},
        {from: "approximately equal to", to: "≈"},
        {from: "±", to: "plus or minus"},
        {from: "plus or minus", to: "±"},
        {from: "∞", to: "infinity"},
        {from: "infinity", to: "∞"},
        {from: "∅", to: "empty set"},
        {from: "empty set", to: "∅"},
        {from: "∈", to: "element of"},
        {from: "element of", to: "∈"},
        {from: "∉", to: "not an element of"},
        {from: "not an element of", to: "∉"},
        {from: "⊂", to: "subset of"},
        {from: "subset of", to: "⊂"},
        {from: "⊃", to: "superset of"},
        {from: "superset of", to: "⊃"},
        {from: "∪", to: "union"},
        {from: "union", to: "∪"},
        {from: "∩", to: "intersection"},
        {from: "intersection", to: "∩"},
        {from: "∑", to: "sum"},
        {from: "sum", to: "∑"},
        {from: "∏", to: "product"},
        {from: "product", to: "∏"},
        {from: "√", to: "square root"},
        {from: "square root", to: "√"},
        {from: "∫", to: "integral"},
        {from: "integral", to: "∫"},
        {from: "∂", to: "partial derivative"},
        {from: "partial derivative", to: "∂"},
        {from: "∇", to: "gradient"},
        {from: "gradient", to: "∇"},
        {from: "∆", to: "delta"},
        {from: "delta", to: "∆"},
        {from: "π", to: "pi"},
        {from: "pi", to: "π"},
        {from: "σ", to: "sigma"},
        {from: "sigma", to: "σ"},
        {from: "µ", to: "mu"},
        {from: "mu", to: "µ"},
        {from: "α", to: "alpha"},
        {from: "alpha", to: "α"},
        {from: "β", to: "beta"},
        {from: "beta", to: "β"},
        {from: "γ", to: "gamma"},
        {from: "gamma", to: "γ"},
        {from: "δ", to: "delta"},
        {from: "delta", to: "δ"},
        {from: "ε", to: "epsilon"},
        {from: "epsilon", to: "ε"},
        {from: "ζ", to: "zeta"},
        {from: "zeta", to: "ζ"},
        {from: "η", to: "eta"},
        {from: "eta", to: "η"},
        {from: "θ", to: "theta"},
        {from: "theta", to: "θ"},
        {from: "ι", to: "iota"},
        {from: "iota", to: "ι"},
        {from: "κ", to: "kappa"},
        {from: "kappa", to: "κ"},
        {from: "λ", to: "lambda"},
        {from: "lambda", to: "λ"},
        {from: "μ", to: "mu"},
        {from: "mu", to: "μ"},
        {from: "ν", to: "nu"},
        {from: "nu", to: "ν"},
        {from: "ξ", to: "xi"},
        {from: "xi", to: "ξ"},
        {from: "ο", to: "omicron"},
        {from: "omicron", to: "ο"},
        {from: "π", to: "pi"},
        {from: "pi", to: "π"},
        {from: "ρ", to: "rho"},
        {from: "rho", to: "ρ"},
        {from: "ς", to: "sigma"},
        {from: "sigma", to: "ς"},
        {from: "τ", to: "tau"},
        {from: "tau", to: "τ"},
        {from: "υ", to: "upsilon"},
        {from: "upsilon", to: "υ"},
        {from: "φ", to: "phi"},
        {from: "phi", to: "φ"},
        {from: "χ", to: "chi"},
        {from: "chi", to: "χ"},
        {from: "ψ", to: "psi"},
        {from: "psi", to: "ψ"},
        {from: "ω", to: "omega"},
        {from: "omega", to: "ω"}
      ];
      
      // Find punctuation to replace
      const error = punctuationErrors[Math.floor(Math.random() * punctuationErrors.length)];
      
      // Only replace one instance for naturalness
      const parts = t.split(error.from);
      if (parts.length < 2) return t;
      
      // Choose a random position to make the error (not at beginning)
      const position = 1 + Math.floor(Math.random() * (parts.length - 1));
      
      return parts.slice(0, position).join(error.from) + 
             error.to + 
             parts.slice(position).join(error.from);
    }
  ];
  
  // For undetectable text, apply multiple typos
  if (options.level === 'undetectable') {
    // Apply 1-3 different typo patterns
    const selectedPatterns: ((t: string) => string)[] = [];
    const patternCount = Math.random() < 0.3 ? 1 : Math.random() < 0.8 ? 2 : 3;
    
    // Select distinct patterns
    while (selectedPatterns.length < patternCount) {
      const pattern = typoPatterns[Math.floor(Math.random() * typoPatterns.length)];
      if (!selectedPatterns.includes(pattern)) {
        selectedPatterns.push(pattern);
      }
    }
    
    // Apply the patterns
    let result = text;
    for (const pattern of selectedPatterns) {
      result = pattern(result);
    }
    return result;
  } else {
    // Choose a random typo pattern
    const selectedPattern = typoPatterns[Math.floor(Math.random() * typoPatterns.length)];
    return selectedPattern(text);
  }
}

// Add natural writing patterns like contractions, emphasis, etc.
function addNaturalWritingPatterns(text: string, options: HumanizationOptions): string {
  if (!options.allowSentenceRestructuring) return text;
  
  // Adjust probability based on level
  let patternProbability;
  switch (options.level) {
    case 'light':
      patternProbability = 0.08;
      break;
    case 'heavy':
      patternProbability = 0.22;
      break;
    case 'moderate':
    default:
      patternProbability = 0.15;
      break;
  }
  
  if (Math.random() > patternProbability) return text;
  
  // Use different patterns based on writing style
  const patterns = options.style === 'academic' ? [
    // Academic writing patterns (more limited, focused on formal structures)
    (t: string) => {
      // Convert "it is", "they are" etc. to contractions if allowed
      if (!options.allowContractions) return t;
      
      const contractionPairs = [
        // Limited contractions appropriate for academic writing
        {full: "it is", contraction: "it's"},
        {full: "that is", contraction: "that's"},
        {full: "there is", contraction: "there's"},
        {full: "here is", contraction: "here's"},
        {full: "who is", contraction: "who's"},
        {full: "what is", contraction: "what's"},
        {full: "where is", contraction: "where's"},
        {full: "when is", contraction: "when's"},
        {full: "why is", contraction: "why's"},
        {full: "how is", contraction: "how's"}
      ];
      
      let modified = t;
      
      // Lower contraction rate for academic writing
      const contractionRate = options.level === 'light' ? 0.4 : 
                             options.level === 'moderate' ? 0.6 : 0.75;
      
      for (const pair of contractionPairs) {
        if (modified.toLowerCase().includes(pair.full) && Math.random() < contractionRate) {
          const regex = new RegExp(`\\b${pair.full}\\b`, 'gi');
          modified = modified.replace(regex, pair.contraction);
        }
      }
      
      return modified;
    }
  ] : [
    // ... existing code for casual patterns ...
  ];
  
  // Apply fewer patterns for academic writing
  const numPatterns = options.style === 'academic' ? 1 : 
                      (Math.random() < 0.7 ? 1 : 2);
  
  let result = text;
  for (let i = 0; i < numPatterns; i++) {
    const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];
    result = selectedPattern(result);
  }
  
  return result;
}

// Add sentence-level humanization
function humanizeSentenceStructure(text: string, options: HumanizationOptions): string {
  if (!options.allowSentenceRestructuring) return text;
  
  // Decrease modification chance for academic writing
  const modificationChance = options.style === 'academic' ? 0.1 : 0.25;
  
  // Split into sentences
  const sentenceRegex = /([^.!?]+[.!?]+\s*)/g;
  const sentences = text.match(sentenceRegex) || [];
  
  if (sentences.length <= 1) return text;
  
  // Choose appropriate sentence elements based on style
  const { starters, fillers, enders } = getTextElements(options);
  
  const modifiedSentences = sentences.map((sentence, index) => {
    // Skip sentences with citations or technical terms if preserving them
    if (options.preserveCitations && containsCitation(sentence)) return sentence;
    if (options.preserveTechnicalTerms && containsTechnicalTerm(sentence)) return sentence;
    
    // Don't modify every sentence to keep it natural
    if (Math.random() > modificationChance) return sentence;
    
    let modified = sentence;
    
    // Add sentence starters with reduced probability for academic writing
    const starterProb = options.style === 'academic' ? 0.1 : 0.25;
    
    if ((index === 0 || Math.random() < 0.15) && 
        !modified.trim().toLowerCase().startsWith("but") && 
        !modified.trim().toLowerCase().startsWith("and") && 
        !modified.trim().toLowerCase().startsWith("or") && 
        !modified.trim().toLowerCase().startsWith("so") && 
        !modified.trim().toLowerCase().startsWith("because")) {
      
      // Add a sentence starter
      if (Math.random() < starterProb) {
        const starter = starters[Math.floor(Math.random() * starters.length)];
        // Ensure first letter after starter is lowercase unless it's "I"
        const firstChar = modified.trim().charAt(0);
        const restOfSentence = modified.trim().substring(1);
        
        if (firstChar.toUpperCase() === 'I' && restOfSentence.charAt(0) === ' ') {
          // Keep "I" uppercase
          modified = starter + firstChar + restOfSentence;
        } else {
          modified = starter + firstChar.toLowerCase() + restOfSentence;
        }
      }
    }
    
    // Add mid-sentence fillers with reduced probability for academic writing
    const fillerProb = options.style === 'academic' ? 0.08 : 0.18;
    
    // Only add fillers to longer sentences
    if (modified.length > 50 && Math.random() < fillerProb) {
      const filler = ", " + fillers[Math.floor(Math.random() * fillers.length)] + ",";
      
      // Find a good position to insert (after a comma or 1/3 through the sentence)
      const commaPos = modified.indexOf(', ');
      const insertPos = commaPos > 10 ? commaPos + 2 : Math.floor(modified.length / 3);
      
      if (insertPos > 0 && insertPos < modified.length - 5) {
        modified = modified.substring(0, insertPos) + filler + modified.substring(insertPos);
      }
    }
    
    // Replace sentence enders with reduced probability for academic writing
    const enderProb = options.style === 'academic' ? 0.05 : 0.1;
    
    if (Math.random() < enderProb && modified.trim().endsWith('.')) {
      const ender = enders[Math.floor(Math.random() * enders.length)];
      modified = modified.trimEnd().slice(0, -1) + ender + ' ';
    }
    
    return modified;
  });
  
  return modifiedSentences.join('');
}

// Function to break very long sentences occasionally
function breakLongSentences(text: string, options: HumanizationOptions): string {
  if (!options.allowSentenceRestructuring) return text;
  
  // For academic writing, be more conservative with sentence breaking
  const breakProbability = options.style === 'academic' ? 0.15 : 0.3;
  const minLength = options.style === 'academic' ? 150 : 120;
  
  const sentenceRegex = /([^.!?]+[.!?]+\s*)/g;
  const sentences = text.match(sentenceRegex) || [];
  
  if (sentences.length === 0) return text;
  
  const modifiedSentences = sentences.map(sentence => {
    // Only process very long sentences
    if (sentence.length < minLength || Math.random() > breakProbability) return sentence;
    
    // Skip sentences with citations if preserving them
    if (options.preserveCitations && containsCitation(sentence)) return sentence;
    
    // Find a good breaking point (after a comma, conjunction, or specific phrase)
    const breakPoints = [
      ...Array.from(sentence.matchAll(/,\s+(?:and|but|or|because|since|although|though|while|when|if|unless)\s+/gi)).map(m => m.index),
      ...Array.from(sentence.matchAll(/,\s+(?:which|who|that|where|when)\s+/gi)).map(m => m.index),
      ...Array.from(sentence.matchAll(/\.\s+/g)).map(m => m.index)
    ].filter(Boolean) as number[];
    
    // If no good break points, add after a comma if possible
    if (breakPoints.length === 0) {
      const commaMatches = Array.from(sentence.matchAll(/,\s+/g));
      // Find a comma roughly 40-70% through the sentence
      const targetLength = sentence.length * (0.4 + Math.random() * 0.3);
      const suitableComma = commaMatches.find(m => (m.index || 0) > targetLength);
      
      if (suitableComma && suitableComma.index) {
        breakPoints.push(suitableComma.index);
      }
    }
    
    if (breakPoints.length === 0) return sentence;
    
    // Choose a break point
    const breakPoint = breakPoints[Math.floor(Math.random() * breakPoints.length)];
    
    // Insert a period and capitalize the next word
    if (breakPoint && breakPoint < sentence.length - 5) {
      const firstPart = sentence.substring(0, breakPoint + 1);
      let secondPart = sentence.substring(breakPoint + 1).trim();
      
      // Capitalize first letter of second part
      if (secondPart.length > 0) {
        secondPart = secondPart.charAt(0).toUpperCase() + secondPart.slice(1);
      }
      
      return firstPart + '. ' + secondPart;
    }
    
    return sentence;
  });
  
  return modifiedSentences.join('');
}

// Inconsistency generator - humans aren't perfectly consistent
function addInconsistencies(text: string, options: HumanizationOptions): string {
  // Skip for academic writing or if sentence restructuring is disabled
  if (options.style === 'academic' || !options.allowSentenceRestructuring) return text;
  
  // Convert the inconsistency level to a probability
  const inconsistencyProbability = (options.inconsistencyLevel || 50) / 100;
  
  if (Math.random() > inconsistencyProbability * 0.2) return text;
  
  const inconsistencies = [
    // Inconsistent hyphenation
    (t: string) => {
      const hyphenPairs = [
        {withHyphen: "e-mail", withoutHyphen: "email"},
        {withHyphen: "co-worker", withoutHyphen: "coworker"},
        {withHyphen: "on-line", withoutHyphen: "online"},
        {withHyphen: "re-use", withoutHyphen: "reuse"},
        {withHyphen: "pre-order", withoutHyphen: "preorder"},
        {withHyphen: "follow-up", withoutHyphen: "followup"},
        {withHyphen: "year-end", withoutHyphen: "yearend"},
        {withHyphen: "life-style", withoutHyphen: "lifestyle"},
        {withHyphen: "top-notch", withoutHyphen: "topnotch"},
        {withHyphen: "check-in", withoutHyphen: "checkin"},
        {withHyphen: "self-care", withoutHyphen: "selfcare"},
        {withHyphen: "part-time", withoutHyphen: "parttime"}
      ];
      
      const pair = hyphenPairs[Math.floor(Math.random() * hyphenPairs.length)];
      
      // Check for both forms in the text
      const hyphenCount = (t.match(new RegExp(`\\b${pair.withHyphen}\\b`, 'gi')) || []).length;
      const noHyphenCount = (t.match(new RegExp(`\\b${pair.withoutHyphen}\\b`, 'gi')) || []).length;
      
      // If both forms already exist, don't modify
      if (hyphenCount > 0 && noHyphenCount > 0) return t;
      
      // If only one form exists, add the other form (but only to one instance)
      if (hyphenCount > 0) {
        const regex = new RegExp(`\\b${pair.withHyphen}\\b`);
        return t.replace(regex, pair.withoutHyphen);
      } else if (noHyphenCount > 0) {
        const regex = new RegExp(`\\b${pair.withoutHyphen}\\b`);
        return t.replace(regex, pair.withHyphen);
      }
      
      return t;
    },
    
    // Inconsistent capitalization of some terms
    (t: string) => {
      const termsToVary = [
        "internet", "web", "email", "website", "online", "app",
        "google", "facebook", "twitter", "youtube", "instagram",
        "monday", "tuesday", "wednesday", "thursday", "friday",
        "january", "february", "march", "april", "may", "june",
        "autumn", "winter", "spring", "summer", "season",
        "company", "team", "group", "department", "division",
        "manager", "director", "ceo", "cfo", "cto"
      ];
      
      const term = termsToVary[Math.floor(Math.random() * termsToVary.length)];
      
      // Find instances of the term (case insensitive)
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      const matches = Array.from(t.matchAll(regex));
      
      if (matches.length <= 1) return t;
      
      // Change capitalization of one instance
      const indexToChange = Math.floor(Math.random() * matches.length);
      
      let modified = t;
      matches.forEach((match, index) => {
        if (index === indexToChange && match.index !== undefined) {
          const currentForm = match[0];
          let newForm;
          
          if (currentForm === currentForm.toLowerCase()) {
            // Capitalize first letter
            newForm = currentForm.charAt(0).toUpperCase() + currentForm.slice(1);
          } else {
            // Make lowercase
            newForm = currentForm.toLowerCase();
          }
          
          modified = modified.substring(0, match.index) + 
                     newForm + 
                     modified.substring(match.index + currentForm.length);
        }
      });
      
      return modified;
    },
    
    // Inconsistent spacing with punctuation
    (t: string) => {
      // This is common in human typing - sometimes adding a space before punctuation
      if (Math.random() < 0.5) {
        // Add a space before a punctuation mark
        const punctuation = ['.', ',', '!', '?', ':', ';'];
        const punct = punctuation[Math.floor(Math.random() * punctuation.length)];
        
        const regex = new RegExp(`\\S\\${punct}`, 'g');
        const matches = Array.from(t.matchAll(regex));
        
        if (matches.length > 0) {
          const randomMatch = matches[Math.floor(Math.random() * matches.length)];
          if (randomMatch.index !== undefined) {
            const pos = randomMatch.index + 1;
            return t.slice(0, pos) + ' ' + t.slice(pos);
          }
        }
      } else {
        // Remove a space after a punctuation mark
        const regex = new RegExp(`[.!?:;,] \\S`, 'g');
        const matches = Array.from(t.matchAll(regex));
        
        if (matches.length > 0) {
          const randomMatch = matches[Math.floor(Math.random() * matches.length)];
          if (randomMatch.index !== undefined) {
            const pos = randomMatch.index + 1;
            return t.slice(0, pos) + t.slice(pos + 1);
          }
        }
      }
      
      return t;
    },
    
    // Inconsistent number formatting
    (t: string) => {
      // Replace some numbers with words or vice versa
      const numberWords = [
        {digit: "1", word: "one"},
        {digit: "2", word: "two"},
        {digit: "3", word: "three"},
        {digit: "4", word: "four"},
        {digit: "5", word: "five"},
        {digit: "6", word: "six"},
        {digit: "7", word: "seven"},
        {digit: "8", word: "eight"},
        {digit: "9", word: "nine"},
        {digit: "10", word: "ten"}
      ];
      
      const pair = numberWords[Math.floor(Math.random() * numberWords.length)];
      
      // Find if both forms exist
      const digitForm = new RegExp(`\\b${pair.digit}\\b`, 'g');
      const wordForm = new RegExp(`\\b${pair.word}\\b`, 'gi');
      
      const digitMatches = Array.from(t.matchAll(digitForm));
      const wordMatches = Array.from(t.matchAll(wordForm));
      
      // If only one form exists with multiple instances, replace one instance with the other form
      if (digitMatches.length > 1 && wordMatches.length === 0) {
        const indexToChange = Math.floor(Math.random() * digitMatches.length);
        const matchToChange = digitMatches[indexToChange];
        
        if (matchToChange.index !== undefined) {
          return t.slice(0, matchToChange.index) + 
                 pair.word + 
                 t.slice(matchToChange.index + pair.digit.length);
        }
      } else if (wordMatches.length > 1 && digitMatches.length === 0) {
        const indexToChange = Math.floor(Math.random() * wordMatches.length);
        const matchToChange = wordMatches[indexToChange];
        
        if (matchToChange.index !== undefined) {
          return t.slice(0, matchToChange.index) + 
                 pair.digit + 
                 t.slice(matchToChange.index + matchToChange[0].length);
        }
      }
      
      return t;
    }
  ];
  
  // Apply one inconsistency
  const selected = inconsistencies[Math.floor(Math.random() * inconsistencies.length)];
  return selected(text);
}

// This function processes text in chunks for better context awareness
function processTextInChunks(text: string, processFn: (text: string, options: HumanizationOptions) => string, options: HumanizationOptions): string {
  // Split into paragraphs
  const paragraphs = text.split(/\n{2,}/);
  
  // Process each paragraph
  const processed = paragraphs.map(paragraph => processFn(paragraph, options));
  
  // Join back together
  return processed.join('\n\n');
}

// Main humanization function with options
export function humanizeTextWithWordReplacement(text: string, userOptions?: Partial<HumanizationOptions>): string {
  // Merge default options with user options
  const options = { ...defaultOptions, ...userOptions };
  
  // Vary replacement probability based on level
  let baseProbability;
  switch (options.level) {
    case 'light':
      baseProbability = 0.45 + (Math.random() * 0.15); // Between 0.45 and 0.6
      break;
    case 'heavy':
      baseProbability = 0.75 + (Math.random() * 0.15); // Between 0.75 and 0.9
      break;
    case 'undetectable':
      baseProbability = 0.85 + (Math.random() * 0.15); // Between 0.85 and 1.0
      break;
    case 'moderate':
    default:
      baseProbability = 0.65 + (Math.random() * 0.2); // Between 0.65 and 0.85
      break;
  }
  
  // First, apply sentence structure improvements (break long sentences)
  text = processTextInChunks(text, breakLongSentences, options);
  
  // Apply inconsistencies that humans naturally have
  if (options.style !== 'academic' || options.level === 'undetectable') {
    // Apply inconsistencies multiple times for undetectable level
    if (options.level === 'undetectable') {
      const inconsistencyCount = 1 + Math.floor(Math.random() * 3); // 1-3 inconsistencies
      for (let i = 0; i < inconsistencyCount; i++) {
        text = addInconsistencies(text, options);
      }
    } else {
      text = addInconsistencies(text, options);
    }
  }
  
  // Split text into paragraphs for context-aware processing
  const paragraphs = text.split(/\n{2,}/);
  
  // Process each paragraph separately to maintain context
  const processedParagraphs = paragraphs.map((paragraph, pIndex) => {
    // Skip paragraphs with citations if option is enabled
    if (options.preserveCitations && containsCitation(paragraph)) {
      return paragraph;
    }
    
    // Slightly adjust probability for each paragraph to create variation
    // For undetectable level, create more variation between paragraphs
    const variabilityFactor = options.level === 'undetectable' ? 
      (0.7 + (Math.random() * 0.6)) : // Between 0.7 and 1.3 for high variability
      (0.9 + (Math.random() * 0.2));  // Between 0.9 and 1.1 for normal variability
    
    const paragraphProbability = baseProbability * variabilityFactor;
    
    // Add extra linguistic tics for undetectable level
    let joinedResult = "";
    
    // Split paragraph into tokens (words and punctuation)
    const tokens = paragraph.split(/(\s+|[.,!?;:()\[\]{}""''`\-—–\n]+)/g);
    
    // Track recent replacements to avoid replacing too many consecutive words
    let recentReplacements = 0;
    
    // For undetectable level, sometimes use a synonym for the same word multiple times
    const repeatedSynonyms: Record<string, string> = {};
    if (options.level === 'undetectable' && Math.random() < 0.4) {
      // Select 1-3 common words to consistently replace with the same synonym
      const commonWords = ["good", "great", "nice", "like", "just", "very", "really", "big", "small", "important"];
      const wordsToConsistentlyReplace = Math.floor(Math.random() * 3) + 1; // 1-3 words
      
      for (let i = 0; i < wordsToConsistentlyReplace; i++) {
        const word = commonWords[Math.floor(Math.random() * commonWords.length)];
        const synonymsList = getSynonyms(word, options);
        
        if (synonymsList && synonymsList.length > 0) {
          const synonym = synonymsList[Math.floor(Math.random() * synonymsList.length)];
          repeatedSynonyms[word] = synonym;
        }
      }
    }
    
    // Process each token with context awareness
    const processedTokens = tokens.map((token, i) => {
      // Skip spaces, line breaks, and punctuation
      if (!token.trim() || /^[\s.,!?;:()\[\]{}""''`\-—–\n]+$/.test(token)) {
        return token;
      }
      
      // Skip if it's a URL, email, or contains digits
      if (/^https?:\/\/|^www\.|^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$|\d/.test(token)) {
        return token;
      }
      
      // Skip if part of a citation and we're preserving citations
      if (options.preserveCitations) {
        const context = tokens.slice(Math.max(0, i - 5), Math.min(tokens.length, i + 5)).join('');
        if (containsCitation(context)) {
          return token;
        }
      }
      
      // Skip if part of a technical term and we're preserving technical terms
      if (options.preserveTechnicalTerms) {
        const context = tokens.slice(Math.max(0, i - 5), Math.min(tokens.length, i + 5)).join('');
        if (containsTechnicalTerm(context)) {
          return token;
        }
      }
      
      // Check if we should consistently replace this token
      const lowerToken = token.toLowerCase();
      if (repeatedSynonyms[lowerToken]) {
        // Preserve capitalization
        if (token[0] === token[0].toUpperCase()) {
          return repeatedSynonyms[lowerToken].charAt(0).toUpperCase() + repeatedSynonyms[lowerToken].slice(1);
        }
        return repeatedSynonyms[lowerToken];
      }
      
      // Dynamic probability adjustment - avoid replacing too many words in a row
      let currentProbability = paragraphProbability;
      
      // For undetectable level, allow more consecutive replacements sometimes
      const maxReplacements = options.level === 'undetectable' ? 6 : 4;
      
      // Reduce probability if we've replaced several words in a row
      if (recentReplacements > 2) {
        currentProbability *= options.level === 'undetectable' ? 0.7 : 0.5;
      }
      
      // Extra reduction for too many consecutive replacements
      if (recentReplacements > maxReplacements) {
        currentProbability *= options.level === 'undetectable' ? 0.5 : 0.3;
      }
      
      // Apply random replacement based on adjusted probability
      if (Math.random() <= currentProbability) {
        const replacement = replaceWord(token, options);
        
        // Update recent replacements counter
        if (replacement !== token) {
          recentReplacements++;
        } else {
          // Reset counter gradually
          recentReplacements = Math.max(0, recentReplacements - 0.5);
        }
        
        return replacement;
      }
      
      // Gradually reduce the recent replacements counter when we skip a word
      recentReplacements = Math.max(0, recentReplacements - 0.5);
      return token;
    });
    
    // Join tokens back into a paragraph
    joinedResult = processedTokens.join('');
    
    // Add occasional filler words/phrases to paragraphs
    const fillerProbability = options.level === 'undetectable' ? 0.35 : 
                             options.level === 'heavy' ? 0.25 : 0.15;
    
    if (options.style !== 'academic' && joinedResult.length > 200 && Math.random() < fillerProbability) {
      // Human writers tend to use more fillers when writing casually
      const extraFillers = [
        " like, ", 
        " I mean, ", 
        " you know, ", 
        " honestly, ", 
        " basically, ",
        " seriously, ",
        " actually, ",
        " I guess ",
        " kinda ",
        " sort of ",
        " in my opinion, ",
        " to be fair, ",
        " obviously, ",
        " clearly, ",
        " to be honest, ",
        " frankly, ",
        " in fact, ",
        " anyway, ",
        " anyhow, "
      ];
      
      // Find a suitable position to insert filler (after sentence break)
      const positions = [...joinedResult.matchAll(/[.!?]\s+[A-Z]/g)].map(m => m.index);
      
      if (positions.length > 0) {
        const position = positions[Math.floor(Math.random() * positions.length)] || 0;
        const filler = extraFillers[Math.floor(Math.random() * extraFillers.length)];
        
        if (position && position > 0 && position < joinedResult.length - 10) {
          // Insert after the space following punctuation
          const insertPosition = position + 2;
          joinedResult = 
            joinedResult.substring(0, insertPosition) + 
            filler + 
            joinedResult.substring(insertPosition);
        }
      }
    }
    
    // Apply natural writing patterns like contractions and emphasis
    joinedResult = addNaturalWritingPatterns(joinedResult, options);
    
    // Get the appropriate text elements for this style and level
    const { starters, fillers, enders } = getTextElements(options);
    
    // Apply sentence humanization with the appropriate elements
    const sentenceOptions = { ...options, starters, fillers, enders };
    joinedResult = humanizeSentenceStructure(joinedResult, sentenceOptions);
    
    // Occasionally add natural typos
    if (options.allowTypos) {
      // For undetectable level, apply typos multiple times
      if (options.level === 'undetectable' && Math.random() < 0.3) {
        // Apply typos 1-2 times
        const typoCount = Math.random() < 0.7 ? 1 : 2;
        for (let i = 0; i < typoCount; i++) {
          joinedResult = addNaturalTypos(joinedResult, options);
        }
      } else {
        joinedResult = addNaturalTypos(joinedResult, options);
      }
    }
    
    return joinedResult;
  });
  
  // Join paragraphs back together with proper spacing
  let finalText = processedParagraphs.join('\n\n');
  
  // Apply pattern breakers as the final step
  finalText = applyPatternBreakers(finalText, options);
  
  return finalText;
}

// Export an even more human-like undetectable version
export function undetectableHumanize(text: string): string {
  return humanizeTextWithWordReplacement(text, {
    level: 'undetectable',
    style: 'professional',
    preserveCitations: true,
    preserveTechnicalTerms: true,
    allowTypos: true,
    allowContractions: true,
    allowSlang: true,
    allowSentenceRestructuring: true,
    inconsistencyLevel: 95 // Extremely high inconsistency for truly human-like text
  });
}

// Hybrid humanization: first apply AI humanization, then apply word-level replacement
export async function hybridHumanize(
  text: string,
  aiHumanizer: (text: string) => Promise<string>,
  options?: Partial<HumanizationOptions>
): Promise<string> {
  // First apply AI-based humanization
  const aiHumanized = await aiHumanizer(text);
  
  // Then apply sentence-level and word-level humanization
  return humanizeTextWithWordReplacement(aiHumanized, options);
}

// Function to create academic-focused humanization
export function academicHumanize(text: string): string {
  return humanizeTextWithWordReplacement(text, {
    level: 'light',
    style: 'academic',
    preserveCitations: true,
    preserveTechnicalTerms: true,
    allowTypos: false,
    allowContractions: true,
    allowSlang: false,
    allowSentenceRestructuring: true
  });
} 

// New progressive humanization function that applies multiple passes (word-level only)
export function progressiveHumanize(text: string): string {
  // First pass - light word-level humanization
  const lightPass = humanizeTextWithWordReplacement(text, {
    level: 'light',
    style: 'professional',
    preserveCitations: true,
    preserveTechnicalTerms: true,
    allowTypos: false,
    allowContractions: true,
    allowSlang: false,
    allowSentenceRestructuring: false, // No sentence restructuring
    inconsistencyLevel: 30
  });
  
  // Second pass - moderate word-level humanization
  const moderatePass = humanizeTextWithWordReplacement(lightPass, {
    level: 'moderate',
    style: 'professional',
    preserveCitations: true,
    preserveTechnicalTerms: true,
    allowTypos: true,
    allowContractions: true,
    allowSlang: false,
    allowSentenceRestructuring: false, // No sentence restructuring
    inconsistencyLevel: 50
  });
  
  // Third pass - heavy word-level humanization
  const heavyPass = humanizeTextWithWordReplacement(moderatePass, {
    level: 'heavy',
    style: 'professional',
    preserveCitations: true,
    preserveTechnicalTerms: true,
    allowTypos: true,
    allowContractions: true,
    allowSlang: true,
    allowSentenceRestructuring: false, // No sentence restructuring
    inconsistencyLevel: 75
  });
  
  // Final pass - undetectable word-level humanization
  return humanizeTextWithWordReplacement(heavyPass, {
    level: 'undetectable',
    style: 'professional',
    preserveCitations: true,
    preserveTechnicalTerms: true,
    allowTypos: true,
    allowContractions: true,
    allowSlang: true,
    allowSentenceRestructuring: false, // No sentence restructuring
    inconsistencyLevel: 95
  });
} 

// Function to break AI detection patterns through advanced techniques
function applyPatternBreakers(text: string, options: HumanizationOptions): string {
  // Skip if not at higher levels of humanization
  if (options.level !== 'heavy' && options.level !== 'undetectable') return text;
  
  // Apply pattern breakers based on probability determined by level
  const probability = options.level === 'undetectable' ? 0.85 : 0.55;
  
  if (Math.random() > probability) return text;
  
  // Collection of techniques that break AI detection patterns
  const patternBreakers = [
    // 1. Add rare unicode punctuation occasionally
    (t: string) => {
      // Unicode punctuation that's visually similar to standard punctuation
      const specialPunctuation = [
        { standard: '.', special: '․' }, // One dot leader (U+2024)
        { standard: ',', special: '،' }, // Arabic comma (U+060C)
        { standard: '!', special: '！' }, // Fullwidth exclamation mark (U+FF01)
        { standard: '?', special: '？' }, // Fullwidth question mark (U+FF1F)
        { standard: ':', special: '։' }, // Armenian full stop (U+0589)
        { standard: '-', special: '‐' }, // Hyphen (U+2010)
        { standard: '"', special: '״' }, // Double prime (U+05F4)
        { standard: "'", special: 'ʼ' }, // Modifier letter apostrophe (U+02BC)
      ];
      
      // Replace 1-2 punctuation marks
      let modified = t;
      const replacements = 1 + Math.floor(Math.random() * 2);
      
      for (let i = 0; i < replacements; i++) {
        const punctPair = specialPunctuation[Math.floor(Math.random() * specialPunctuation.length)];
        // Find instances of standard punctuation
        const instances = [...modified.matchAll(new RegExp(`\\${punctPair.standard}`, 'g'))];
        
        if (instances.length > 0) {
          // Choose a random instance to replace
          const instanceToReplace = instances[Math.floor(Math.random() * instances.length)];
          if (instanceToReplace.index !== undefined) {
            modified = 
              modified.substring(0, instanceToReplace.index) + 
              punctPair.special + 
              modified.substring(instanceToReplace.index + 1);
          }
        }
      }
      
      return modified;
    },
    
    // 2. Insert zero-width non-joiners or other invisible characters
    (t: string) => {
      // Invisible or nearly invisible characters
      const invisibleChars = [
        '\u200C', // Zero-width non-joiner
        '\u200D', // Zero-width joiner
        '\u2060', // Word joiner
        '\u200B', // Zero-width space
        '\uFEFF'  // Zero-width no-break space
      ];
      
      // Insert 1-5 invisible characters at random positions
      let modified = t;
      const insertions = 1 + Math.floor(Math.random() * 4);
      
      for (let i = 0; i < insertions; i++) {
        const pos = Math.floor(Math.random() * modified.length);
        const char = invisibleChars[Math.floor(Math.random() * invisibleChars.length)];
        modified = modified.substring(0, pos) + char + modified.substring(pos);
      }
      
      return modified;
    },
    
    // 3. Create deceptive spacing patterns
    (t: string) => {
      // Standard space vs different space characters
      const spaceVariants = [
        '\u00A0', // Non-breaking space
        '\u2002', // En space
        '\u2003', // Em space
        '\u2004', // Three-per-em space
        '\u2005', // Four-per-em space
        '\u2006', // Six-per-em space
      ];
      
      // Replace a few spaces with variant spaces
      let modified = t;
      const replacements = Math.floor(modified.length / 200) + 1; // More for longer text
      
      for (let i = 0; i < replacements; i++) {
        const spaceVariant = spaceVariants[Math.floor(Math.random() * spaceVariants.length)];
        // Find a regular space
        const spaceIndices = [...modified.matchAll(/ /g)].map(m => m.index).filter((i): i is number => i !== undefined);
        
        if (spaceIndices.length > 0) {
          const randomIndex = spaceIndices[Math.floor(Math.random() * spaceIndices.length)];
          modified = modified.substring(0, randomIndex) + spaceVariant + modified.substring(randomIndex + 1);
        }
      }
      
      return modified;
    },
    
    // 4. Mix quotation mark styles
    (t: string) => {
      const quoteVariants = [
        { open: '"', close: '"', altOpen: '"', altClose: '"' },  // Double quotes to curly quotes
        { open: "'", close: "'", altOpen: '\u2018', altClose: '\u2019' },  // Single quotes to curly single quotes
        { open: '"', close: '"', altOpen: '«', altClose: '»' }   // Double quotes to guillemets
      ];
      
      let modified = t;
      
      // Pick a variant to use
      const variant = quoteVariants[Math.floor(Math.random() * quoteVariants.length)];
      
      // Find open quote
      const openIndex = modified.indexOf(variant.open);
      if (openIndex >= 0) {
        // If we find an open quote, look for the matching close quote
        const afterOpen = modified.substring(openIndex + 1);
        const closeIndex = afterOpen.indexOf(variant.close);
        
        if (closeIndex >= 0) {
          // Replace both with the alternative quotes
          modified = 
            modified.substring(0, openIndex) + 
            variant.altOpen + 
            afterOpen.substring(0, closeIndex) + 
            variant.altClose + 
            afterOpen.substring(closeIndex + 1);
        }
      }
      
      return modified;
    },
    
    // 5. Insert subtle text encoding variations
    (t: string) => {
      // Characters with combining diacritical marks that revert to normal when normalized
      const combiningMark = '\u0307'; // Combining dot above
      
      let modified = t;
      
      // Select random positions to add combining marks
      const positions = Math.floor(modified.length / 500) + 1; // More for longer text
      
      for (let i = 0; i < positions; i++) {
        const randomPos = Math.floor(Math.random() * modified.length);
        if (randomPos < modified.length) {
          modified = modified.substring(0, randomPos + 1) + combiningMark + modified.substring(randomPos + 1);
        }
      }
      
      return modified;
    }
  ];
  
  // Apply 1-3 pattern breakers for undetectable level, 1 for heavy
  const breakerCount = options.level === 'undetectable' 
    ? 1 + Math.floor(Math.random() * 3) 
    : 1;
  
  // Apply selected pattern breakers
  let result = text;
  
  // Select distinct pattern breakers
  const selectedBreakers: ((t: string) => string)[] = [];
  while (selectedBreakers.length < breakerCount) {
    const breaker = patternBreakers[Math.floor(Math.random() * patternBreakers.length)];
    if (!selectedBreakers.includes(breaker)) {
      selectedBreakers.push(breaker);
    }
  }
  
  // Apply breakers
  for (const breaker of selectedBreakers) {
    result = breaker(result);
  }
  
  return result;
}

// ... existing code ...