export const MODELS = {
  GPT4: 'gpt-4',
  CLAUDE: 'claude-3-opus-20240229',
  GEMINI: 'gemini-pro',
} as const;

export type ModelType = keyof typeof MODELS;

export const MODEL_NAMES = {
  [MODELS.GPT4]: 'GPT-4',
  [MODELS.CLAUDE]: 'Claude 3',
  [MODELS.GEMINI]: 'Gemini Pro',
} as const;

export const RATE_LIMITS = {
  [MODELS.GPT4]: 200,
  [MODELS.CLAUDE]: 150,
  [MODELS.GEMINI]: 100,
} as const;