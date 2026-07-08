import type {
  PresignedUploadRequest,
  PreSignedUploadResponse,
} from "@cloudpix/shared";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/**
 * Request a presigned upload URL from the Express backend.
 * POST /api/uploads/url
 */
export async function getPresignedUploadUrl(
  payload: PresignedUploadRequest
): Promise<PreSignedUploadResponse> {
  const res = await fetch(`${API_BASE_URL}/api/uploads/url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(
      (error as { message?: string }).message ??
        `Failed to get presigned URL (${res.status})`
    );
  }

  return res.json() as Promise<PreSignedUploadResponse>;
}

/**
 * Upload a file directly to S3 using a presigned URL.
 * Reports progress via the onProgress callback.
 */
export function uploadFileToS3(
  presignedUrl: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`S3 upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("S3 upload failed")));
    xhr.addEventListener("abort", () => reject(new Error("S3 upload aborted")));

    xhr.open("PUT", presignedUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.send(file);
  });
}
