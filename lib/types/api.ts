export interface UploadResponse {
  success: boolean;
  data?: {
    summary: string;
    extractedInfo: {
      topics: string[];
      keyPoints: string[];
      entities: string[];
    };
    confidence: number;
    suggestedQuestions: string[];
    modelUsed: string;
    processingTime: number;
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface UploadRequest {
  model: "gpt4" | "claude" | "gemini";
  file: File;
}

export interface FileContent {
  type: 'pdf' | 'image';
  content: Buffer;
  mimeType: string;
}