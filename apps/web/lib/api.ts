import type {
  PresignedUploadRequest,
  PreSignedUploadResponse,
} from "@cloudpix/shared";

/* ─── Types ─── */

export interface UploadStatusResponse {
  id: string;
  uploadId: string;
  status: "UPLOADED" | "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";
  ocrText: string | null;
  thumbnailKey: string | null;
  processedKey: string | null;
  thumbnailUrl?: string | null;
  processedUrl?: string | null;
  originalUrl?: string | null;
}

/* ─── Presigned Upload ─── */

/**
 * Request a presigned upload URL from the Express backend.
 * POST /api/upload/presigned-url
 *
 * Requests are proxied through Next.js rewrites to avoid CORS.
 */
export async function getPresignedUploadUrl(
  payload: PresignedUploadRequest
): Promise<PreSignedUploadResponse> {
  const res = await fetch("/api/upload/presigned-url", {
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

/* ─── S3 Upload ─── */

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

/* ─── Upload Status ─── */

/**
 * Fetch the processing status of an upload.
 * GET /api/upload/:uploadId/status
 */
export async function getUploadStatus(
  uploadId: string
): Promise<UploadStatusResponse> {
  const res = await fetch(
    `/api/upload/${encodeURIComponent(uploadId)}/status`
  );

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(
      (error as { message?: string }).message ??
        `Failed to fetch upload status (${res.status})`
    );
  }

  return res.json() as Promise<UploadStatusResponse>;
}

/* ─── Asset History ─── */

export interface AssetResponse {
  id: string;
  uploadId: string;
  originalFileName: string;
  mimeType: string;
  size: number;
  status: "UPLOADED" | "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";
  createdAt: string;
  s3Key?: string;
  processedKey?: string | null;
  thumbnailKey?: string | null;
  processedUrl?: string | null;
  thumbnailUrl?: string | null;
  originalUrl?: string | null;
}

/**
 * Fetch recent uploads from the backend.
 * GET /api/asset
 */
export async function fetchRecentUploads(): Promise<AssetResponse[]> {
  const res = await fetch("/api/asset");

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(
      (error as { message?: string }).message ??
        `Failed to fetch recent uploads (${res.status})`
    );
  }

  return res.json() as Promise<AssetResponse[]>;
}
