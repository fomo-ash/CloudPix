import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

/* ─── S3 Key Helpers ─── */

const S3_PUBLIC_URL =
  process.env.NEXT_PUBLIC_S3_URL ?? "https://cloudpix-dev-ashutosh.s3.ap-south-1.amazonaws.com";

/**
 * Convert an S3 object key into a publicly accessible URL.
 * All URL generation is isolated here so it can be updated in one place
 * when the CDN / bucket config changes.
 */
export function getAssetUrl(s3Key: string): string {
  return `${S3_PUBLIC_URL}/${s3Key}`;
}

/**
 * Programmatically download an image file by fetching its blob.
 * Works for S3, CDN, and local URLs cleanly.
 */
export async function downloadAsset(url: string, filename: string): Promise<void> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.warn("Direct blob download failed, opening URL:", err);
    window.open(url, "_blank");
  }
}

/**
 * Extract the uploadId from an S3 key.
 *
 * The upload service generates keys in the format:
 *   originals/{uploadId}/{filename}
 *
 * TODO: Remove this once the backend returns `uploadId` directly in the
 * PreSignedUploadResponse. This helper is a temporary workaround that
 * couples the frontend to the S3 folder structure.
 */
export function extractUploadId(s3Key: string): string {
  // Expected format: "originals/{uploadId}/{filename}"
  const parts = s3Key.split("/");
  if (parts.length >= 2) {
    return parts[1]!;
  }
  throw new Error(`Cannot extract uploadId from s3Key: ${s3Key}`);
}
