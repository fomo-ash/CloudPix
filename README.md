<div align="center">
  <h1>☁️ CloudPix</h1>
  <p><strong>A Highly Scalable, Event-Driven Media Processing Pipeline</strong></p>
</div>

<br />

## Overview

CloudPix is a production-grade, **event-driven media processing backend**. Unlike traditional upload APIs where heavy image processing happens synchronously on the main server, CloudPix relies entirely on an asynchronous, decoupled architecture using AWS S3 and SQS. 

The API's single responsibility is orchestrating secure uploads. All CPU-intensive work—like image compression, thumbnail generation, and Optical Character Recognition (OCR)—is delegated to independent background workers.

This architectural decision yields massive benefits:
- **Zero API Bottlenecks:** The Express API responds instantly to clients.
- **Extreme Scalability:** Workers scale independently from the web API.
- **Separation of Concerns:** Business logic, infrastructure routing, and heavy processing are completely isolated.
- **Extensibility:** New processing stages can be added easily without changing core routing.

---

## 🏛 Core Architectural Philosophy

### 1. Direct Uploads to S3
A traditional approach routes large files through the backend API. CloudPix uses a **Direct-to-Cloud Upload Strategy**.

```text
Client ──(Request URL)──▶ API ──(Generate Presigned URL)──▶ Client ──(Upload Directly)──▶ AWS S3
```

**Why?**
- API bandwidth and memory consumption remain extremely low.
- Large files never touch or congest the backend server.
- Massively improves concurrent user scalability.

### 2. Event-Driven Execution (S3 + SQS)
Once the direct upload completes, S3 automatically emits an `ObjectCreated` event. This event is routed to an **AWS SQS Queue**. The backend does not need to poll S3, schedule cron jobs, or rely on manual client triggers. AWS handles the event lifecycle reliably.

By using SQS as a buffer:
- The upload finishes quickly while heavy work happens in the background.
- It provides **at-least-once delivery**, ensuring that failed processing jobs are re-queued and retried.

### 3. Decoupled Worker & Handlers
The worker service is intentionally small and generic. Its only responsibilities are to long-poll SQS, parse the event payload, dispatch it to registered handlers, and delete the message upon successful execution.

**The worker knows nothing about images, Sharp, OCR, or PostgreSQL.** It simply routes events.

Instead, the **Handlers** own the workflow. Just like an Express API routes HTTP requests to Controllers, the worker routes SQS events to Handlers. This means new processing handlers (e.g., Video Handler, PDF Handler) can be added without ever changing the core worker logic.

---

## ⚙️ Media Processing Deep Dive

The processing handler executes a rigorous pipeline specifically optimized for containerized environments.

### In-Memory Buffers over Temporary Files
CloudPix processes files directly in memory using Node.js `Buffer`s.
```text
S3 ──(Object Stream)──▶ Memory Buffer ──(Sharp Processing)──▶ Memory Buffer ──(Upload)──▶ S3
```
**Why?**
- Avoids creating temporary files on the disk.
- Significantly lowers disk I/O, accelerating the pipeline.
- Perfectly suited for ephemeral container deployments (Docker, ECS, Fly.io) or Serverless architectures where filesystem writes are costly or prohibited.

### Compression & Thumbnails (Sharp + libvips)
CloudPix uses [Sharp](https://github.com/lovell/sharp) (backed by the ultra-fast C library `libvips`) to process images. The pipeline ensures:
- **Auto-Rotation:** Applies EXIF orientation to correct mobile device photos.
- **Smart Resizing:** Images are resized to a maximum width of 1920px (`fit: "inside"`), ensuring large files are scaled down without ever enlarging small ones.
- **Optimized Encoding:** All outputs are converted to `mozjpeg` with a quality of 80, striking an ideal balance between file size and visual fidelity.
- **Thumbnail Generation:** Generates lightweight 150x150 center-cropped (`cover`) thumbnails for rapid UI loading.

*Result:* This pipeline routinely achieves a **>50% reduction** in storage size while maintaining excellent quality.

### Optical Character Recognition (OCR)
The pipeline features automated text extraction using **Tesseract.js**.
- **The WEBP Challenge:** Tesseract natively struggles to decode `.webp` buffers. To solve this, CloudPix intercepts the buffer, uses Sharp to transcode it to PNG in-memory, and passes the clean PNG to the OCR engine.
- **Error Boundaries:** The OCR service is strictly typed and heavily wrapped in error boundaries. If a complex image (like an ID card with holograms) fails OCR, it gracefully degrades rather than crashing the pipeline.
- *Future Consideration:* While Tesseract handles clean documents perfectly, CloudPix's architecture is designed so that Tesseract can be hot-swapped for cloud-based AI services (like AWS Textract or Google Cloud Vision) for complex real-world document processing, without rewriting the pipeline.

### Uploading & Message Acknowledgement
1. The processed image and thumbnail are uploaded back to S3 into a `processed/` bucket directory.
2. The asset's status and extracted OCR text are synced to **Supabase PostgreSQL**.
3. **Only after** the database is updated successfully does the worker delete the message from SQS. If any step fails, the visibility timeout expires and the worker retries the job.

---

## 📦 Monorepo Package Responsibilities

The codebase relies on a strict separation of concerns utilizing a shared monorepo structure:

- **`@cloudpix/api`**: Handles HTTP requests, input validation, DB asset creation, and generating S3 presigned URLs. Never touches an image.
- **`@cloudpix/worker`**: Long-polls SQS, parses event bodies, and dispatches to media handlers.
- **`@cloudpix/aws`**: A dedicated wrapper for the AWS SDK (S3, SQS). Other packages interact with this wrapper rather than calling AWS SDK directly, ensuring vendor lock-in mitigation and clean interfaces.
- **`@cloudpix/shared`**: Contains DTOs, API interfaces, types, and event parsers shared across the API and Worker to prevent code duplication.

---

## 🚀 The Complete Data Flow

1. **Client** requests a presigned URL from the **Express API**.
2. **API** creates a pending asset record in **PostgreSQL** and returns the AWS S3 URL.
3. **Client** uploads the raw image directly to the **S3 Original Bucket**.
4. **S3** publishes an `ObjectCreated` event to the **SQS Queue**.
5. **Worker Service** polls the queue, parses the message, and triggers the `s3-object-created` handler.
6. **Handler** updates the DB status to `PROCESSING` and downloads the image as an in-memory buffer.
7. **Media Service** uses Sharp to compress the image, generate a thumbnail, and uses Tesseract to extract OCR text.
8. **Handler** uploads the new assets to the **S3 Processed Bucket** and updates the DB with the final keys and OCR data.
9. **Worker** deletes the message from SQS. 
10. **Client** accesses the optimized assets globally via **AWS CloudFront (CDN)**.

---
*CloudPix represents a fully modernized approach to handling media at scale, favoring asynchronous event-driven design over synchronous API monoliths.*
