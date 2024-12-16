import { UploadRequest, UploadResponse } from "@/types/api";

export async function uploadFile(
  request: UploadRequest
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", request.file);
  formData.append("model", request.model);

  try {
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Upload failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
}