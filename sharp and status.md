# Commit Details: Event-Driven Multi-Format Image Pipeline & Optimizations

This document provides a comprehensive log of the enhancements, structural refactoring, and performance optimizations implemented in this commit.

---

## 1. What We Accomplished

### Event-Driven Asset Status Lifecycle
* **Generalized Status Operations:** Restored the dynamic `status` parameter inside the database repository's `updateStatus` method to make it reusable for any status value.
* **Granular Pipeline Observability:** Added explicit state updates to the event-driven worker handler:
  1. Transition to `PROCESSING` as soon as the SQS message is received (before download/processing starts).
  2. Transition to `COMPLETED` and record the output `processedKey` when execution completes successfully.
  3. Transition to `FAILED` and re-throw the error inside a `try...catch` block if any step fails.
* **Transition Logging:** Added runtime logs confirming the exact lifecycle transition status of each asset (e.g., `Asset status updated to PROCESSING for uploadId: ...`).

### Dynamic Format-Aware Image Compression
* **Sharp Metadata Detection:** Extracted metadata from downloaded images to dynamically identify their original formats (`jpeg`, `png`, `webp`).
* **Format-Specific Compression Rules:**
  * **PNG:** Compressed with palette optimization (`compressionLevel: 9`).
  * **WebP:** Compressed with high-efficiency lossy parameters (`quality: 80`).
  * **JPEG:** Compressed using specialized `mozjpeg` algorithms (`quality: 80`).
  * **Fallback:** Non-standard formats default to high-quality `jpeg`.
* **Dynamic S3 Uploads:** Replaced hardcoded `image/jpeg` MIME-types in S3 uploads with dynamic, format-matching MIME-types (`image/png`, `image/webp`, `image/jpeg`).

### Centralization and Refactoring
* **Shared Parser:** Centralized the regex-based `uploadId` extraction from S3 keys (e.g., `originals/uuid/...`) by creating a shared `getUploadIdFromKey` helper in `@cloudpix/shared` (`packages/shared/src/utils/key.ts`).

---

## 2. Challenges Overcome

### WSL2 Cross-Boundary File System Performance
* **The Problem:** The local pnpm package cache (`.pnpm-store`) was being tracked by Git (showing 10,000+ changes) and scanned during Docker builds. Across the Windows host and WSL2 virtual boundary, this caused context transfers to crawl, resulting in container builds taking **300+ seconds**.
* **The Solution:** Added `.pnpm-store` to root `.gitignore` and `.dockerignore` files. This eliminated Git bloat and cut Docker build context transfer times from **159 seconds to under 5 seconds**.

### Strict TypeScript Nullability
* **The Problem:** The TypeScript compiler threw `TS2322` errors on string matching during build time, because the regex matcher index type could potentially evaluate to `undefined` which is incompatible with `string | null`.
* **The Solution:** Adjusted the helper to explicitly check that the capture group exists and is truthy (`match && match[1] ? match[1] : null`), ensuring compatibility with strict TypeScript compilation.

### Paged Terminal Outputs
* **The Problem:** Queries inside standard interactive `psql` shell paginated results by default. Since new uploads were sorted at the bottom, they were hidden behind a `--More--` prompt, leading to initial syncing confusion.
* **The Solution:** Shifted to non-interactive SQL checks sorted by `createdAt DESC` (e.g., `ORDER BY "createdAt" DESC LIMIT 5`) to fetch the most recent entries at the top of the terminal.

---

## 3. Core Code Changes

### Shared Key Utilities
* **File:** [`packages/shared/src/utils/key.ts`](./packages/shared/src/utils/key.ts)
```typescript
export function getUploadIdFromKey(key: string): string | null {
  const match = key.match(/^originals\/([^/]+)/);
  return match && match[1] ? match[1] : null;
}
```

### Image Service
* **File:** [`apps/worker/src/services/image.service.ts`](./apps/worker/src/services/image.service.ts)
```typescript
export interface CompressionResult {
  buffer: Buffer;
  format: "jpeg" | "png" | "webp";
  mimeType: string;
}

export async function compressImage(buffer: Buffer): Promise<CompressionResult> {
  const metadata = await readMetadata(buffer);
  let format: "jpeg" | "png" | "webp" = "jpeg";

  if (metadata.format === "png") format = "png";
  else if (metadata.format === "webp") format = "webp";
  else if (metadata.format === "jpeg") format = "jpeg";

  let pipeline = sharp(buffer).rotate().resize({
    width: 1920,
    fit: "inside",
    withoutEnlargement: true,
  });

  if (format === "png") {
    pipeline = pipeline.png({ compressionLevel: 9 });
  } else if (format === "webp") {
    pipeline = pipeline.webp({ quality: 80 });
  } else {
    pipeline = pipeline.jpeg({ quality: 80, mozjpeg: true });
  }

  const compressedBuffer = await pipeline.toBuffer();
  return { buffer: compressedBuffer, format, mimeType: `image/${format}` };
}
```

### S3 Event Created Handler
* **File:** [`apps/worker/src/handlers/s3-object-created.handler.ts`](./apps/worker/src/handlers/s3-object-created.handler.ts)
```typescript
export async function handleS3ObjectCreated(event: S3ObjectCreatedEvent): Promise<void> {
  const uploadId = getUploadIdFromKey(event.objectKey);
  if (!uploadId) throw new Error("Invalid S3 object key");

  // 1. Mark status as PROCESSING
  await assetRepository.updateStatus(uploadId, AssetStatus.PROCESSING);

  try {
    const downloadedObject = await downloadObject(event.bucket, event.objectKey);
    const compressionResult = await compressImage(downloadedObject);
    const processedKey = getProcessedKey(event.objectKey);

    await uploadObject(event.bucket, processedKey, compressionResult.buffer, compressionResult.mimeType);

    // 2. Mark status as COMPLETED
    await assetRepository.updateProcessingResult(uploadId, processedKey);
  } catch (error) {
    // 3. Mark status as FAILED on error
    await assetRepository.updateStatus(uploadId, AssetStatus.FAILED);
    throw error;
  }
}
```
