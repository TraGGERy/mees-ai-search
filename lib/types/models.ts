export interface Model {
  id: string
  name: string
  provider: string
  providerId: string
  description: string
}

export const models: Model[] = [
  {
    id: 'gpt-4o-mini',
    name: 'Auto',
    provider: 'OpenAI',
    providerId: 'openai',
    description: 'Best for daily search'
  },
  {
    id: 'claude-3-5-sonnet-latest',
    name: 'Pro',
    provider: 'Anthropic',
    providerId: 'anthropic',
    description: '3x faster than Auto & detailed answers'
  },
  
  // The following models are temporarily disabled.
  // Uncomment the lines below to enable these experimental models.
  // {
  //   id: 'experimental-model-1',
  //   name: 'Experimental Model 1',
  //   provider: 'Experimental',
  //   providerId: 'experimental'
  // },
  // {
  //   id: 'experimental-model-2',
  //   name: 'Experimental Model 2',
  //   provider: 'Experimental',
  //   providerId: 'experimental'
  // },
 // {
//  id: 'claude-3-5-haiku-20241022',
//  name: 'Claude 3.5 Haiku',
//  provider: 'Anthropic',
//  providerId: 'anthropic'\
// },
  
  //{
  //  id: 'accounts/fireworks/models/deepseek-r1',
 //   name: 'Reasoning',
 //   provider: 'Fireworks',
  //  providerId: 'fireworks',
 //   description: 'Reasoning with R1, deepseek'
 // },

  {
    id: 'deepseek-reasoner',
    name: 'R1',
    provider: 'DeepSeek',
    providerId: 'deepseek',
     description: 'Strong logical reasoning capabilities'
     },
  //{
  //  id: 'deepseek-reasoner',
  //  name: 'DeepSeek R1',
  //  provider: 'DeepSeek',
  //  providerId: 'deepseek',
  //  description: 'Strong logical reasoning capabilities'
  //},
 // {
 //   id: 'deepseek-chat',
 //   name: 'DeepSeek V3',
//  provider: 'DeepSeek',
//   providerId: 'deepseek'
//  },
   //{
  //   id: 'gemini-2.0-pro-exp-02-05',
  //   name: 'Gemini 2.0 Pro (Exp)',
  //   provider: 'Google Generative AI',
  //   providerId: 'google',
  //   description: 'Advanced multimodal AI assistant'
  // },
  // {
     //id: 'gemini-2.0-flash-thinking-exp-01-21',
    // name: 'Gemini 2.0 Flash Thinking (Exp)',
    // provider: 'Google Generative AI',
    // providerId: 'google',
    // description: 'Quick responses with creative thinking'
  // },
  {
    id: 'gemini-2.0-flash',
    name: 'Deep',
    provider: 'Google Generative AI',
    providerId: 'google',
    description: 'In-depth reports on complex topics'
  },
 // {
 //   id: 'deepseek-r1-distill-llama-70b',
//    name: 'DeepSeek R1 Distill Llama 70B',
//    provider: 'Groq',
 //   providerId: 'groq'
//  },
 // {
 //   id: process.env.NEXT_PUBLIC_OLLAMA_MODEL || 'deepseek-r1',
 //   name: process.env.NEXT_PUBLIC_OLLAMA_MODEL || 'DeepSeek R1',
 //   provider: 'Ollama',
 //   providerId: 'ollama',
 //   description: 'Local AI with custom models'
 // },
  // {
  //   id: 'o3-mini',
  //   name: 'Reasoning with o3-mini(beta)',
  //   provider: 'OpenAI',
   //  providerId: 'openai',
   //  description: 'OpenAI model for reasoning'
   //},
 // {
 //   id: 'gpt-4o',
 //   name: 'GPT-4o',
 //   provider: 'OpenAI',
 //   providerId: 'openai',
 //   description: 'Powerful general purpose AI assistant'
 // },

  
]

export interface PdfDocument {
  id: string;
  userId: string; // Links to user who uploaded it
  originalFilename: string;
  extractedText: string;
  embeddings?: number[]; // If using semantic search
  chunkedText?: string[]; // If chunking text
  createdAt: Date;
}

export interface ImageDocument {
  id: string;
  userId: string;
  filePath: string;
  embeddings: number[];
  metadata?: {
    width: number;
    height: number;
    format: string;
    ocrText?: string; // If extracting text from images
  };
  uploadedAt: Date;
}

export type PdfSearchResult = {
  documentId: string;
  snippet: string;
  pageNumber?: number;
  similarityScore?: number;
};

export type ImageSearchResult = {
  imageId: string;
  thumbnailUrl: string;
  similarityScore: number;
};

export interface SubscribedUser {
  // Existing fields...
  pdfSearchLimit?: number;
  imageSearchLimit?: number;
}
