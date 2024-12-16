import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { promises as fs } from "fs";
import formidable, { IncomingForm, Fields, Files, File } from "formidable";
import { z } from "zod";
import { analyzeWithGPT4 } from "@/lib/uploads/services/openai";
import { analyzeWithClaude } from "@/lib/uploads/services/anthropic";
import { analyzeWithGemini } from "@/lib/uploads/services/google";
import { processFile } from "@/lib/uploads/utils/file-processor";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"),
});

const FileSchema = z.object({
  type: z.enum(["image/jpeg", "image/png", "application/pdf"]),
  size: z.number().max(10 * 1024 * 1024), // 10MB
});

const RequestSchema = z.object({
  model: z.enum(["gpt4", "claude", "gemini"]),
  file: FileSchema,
});

const modelAnalyzers = {
  gpt4: analyzeWithGPT4,
  claude: analyzeWithClaude,
  gemini: analyzeWithGemini,
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Ratelimit check
    const ip = req.ip ?? "127.0.0.1";
    const { success, reset } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: `Rate limit exceeded. Try again in ${Math.ceil(
              (reset - Date.now()) / 1000
            )} seconds`,
          },
        },
        { status: 429 }
      );
    }

    // Formidable form setup
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowEmptyFiles: false,
      filter: (part) =>
        part.name === "file" &&
        (part.mimetype?.includes("image/") || part.mimetype === "application/pdf"),
    });

    // Parse the form data
    const [fields, files]: [Fields, Files] = await new Promise((resolve, reject) => {
      form.parse(req as any, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    // Validate the request and file data
    const file = Array.isArray(files.file) ? files.file[0] : undefined;
    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FILE_MISSING",
            message: "No file was uploaded",
          },
        },
        { status: 400 }
      );
    }

    const validation = RequestSchema.safeParse({
      model: fields.model?.[0],
      file: {
        type: file.mimetype,
        size: file.size,
      },
    });

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: validation.error.message,
          },
        },
        { status: 400 }
      );
    }

    // Read and process the file
    const fileContent = await fs.readFile(file.filepath);
    const processedFile = await processFile(fileContent, file.mimetype!);

    // Run the model analyzer and measure processing time
    const startTime = Date.now();
    const analyzer = modelAnalyzers[validation.data.model as keyof typeof modelAnalyzers];
    const analysis = await analyzer(processedFile);
    const processingTime = Date.now() - startTime;

    // Clean up file after processing
    await fs.unlink(file.filepath);

    return NextResponse.json({
      success: true,
      data: {
        ...analysis,
        processingTime,
        modelUsed: validation.data.model,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred",
        },
      },
      { status: 500 }
    );
  }
}
