export interface Model {
  id: string
  name: string
  provider: string
  providerId: string
  description: string
  isPro?: boolean
  isCopilot?: boolean
  isSpeed?: boolean
}

export const models: Model[] = [
  
  {
    id: 'gpt-4o-mini',
    name: 'Speed',
    description: 'High speed, but lower quality. (GPT-4o-mini)',
    provider: 'OpenAI',
    providerId: 'openai',
    isSpeed: true
  },
  {
    id: 'gpt-4o',
    name: 'Quality (GPT)',
    description: 'High quality generation. (GPT-4o)',
    provider: 'OpenAI',
    providerId: 'openai',
    isPro: true
  },
  
  {
    id: 'claude-3-5-sonnet-latest',
    name: 'Quality (Claude)',
    description: 'High quality & best for Copilot. (Claude-3.5-Sonnet)',
    provider: 'Anthropic',
    providerId: 'anthropic',
    isPro: true,
    isCopilot: true
  },
  {
    id: 'claude-3-5-haiku-20241022',
    name: 'Speed (Claude)',
    description: 'High speed, but bit lower quality. (Claude-3.5-Haiku)',
    provider: 'Anthropic',
    providerId: 'anthropic',
    isPro: true,
    isSpeed: true
  },
  {
    id: 'gemini-2.0-flash-exp',
    name: 'Lightning Strike',
    description: 'Experimental (DeepSeek-v3)',
    provider: 'Google Generative AI',
    providerId: 'google',
    isPro: true,
    isSpeed: true
  },
  // Deepseek function calling is currently unstable: https://github.com/vercel/ai/issues/4313#issuecomment-2587891644
  // If you want to use Deepseek, remove the comment and add it to the models array
  // {
  //   id: 'deepseek-chat',
  //   name: 'DeepSeek v3 (Experimental)',
  //   provider: 'DeepSeek',
  //   providerId: 'deepseek'
  // },
 
  
]
