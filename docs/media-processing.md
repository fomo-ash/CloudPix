# CloudPix Media Processing Pipeline

## Overview

CloudPix follows an **event-driven asynchronous processing architecture**. The API is responsible only for accepting upload requests and generating pre-signed URLs. All CPU-intensive work is delegated to a background worker.

The current processing pipeline is:

```text
                 Client
                    │
                    ▼
        Request Presigned URL
                    │
                    ▼
              Express API
                    │
          Create Asset Record
                    │
         Generate Presigned URL
                    ▼
             Upload directly to S3
                    │
                    ▼
     originals/<uploadId>/image.png
                    │
      S3 ObjectCreated Event Notification
                    ▼
                 AWS SQS Queue
                    │
        Worker Long Polls Queue
                    ▼
         handleS3ObjectCreated()
                    │
        Download Original Image
                    ▼
            Buffer in Memory
                    │
             Sharp Compression
                    ▼
         Compressed Image Buffer
                    │
      Upload to processed/ folder
                    ▼
 processed/<uploadId>/image.jpg
```

---

# Why S3 + SQS?

CloudPix intentionally separates uploads from processing.

Instead of:

```text
Client
   │
Upload
   │
Compress
   │
Response
```

CloudPix performs:

```text
Upload
   │
Immediate Response
   │
Background Processing
```

This reduces API latency and allows workers to scale independently.

---

# Current Responsibilities

## [Express API](../apps/api/)

Responsible for:

* Creating Asset records in the database
* Generating S3 pre-signed upload URLs
* Returning pre-signed URLs to clients

The API never processes images.

---

## Amazon S3

Stores uploaded media.

When an object is successfully uploaded, S3 automatically publishes an `ObjectCreated` event.

The uploaded image itself is **not** sent to SQS.

Only metadata such as:

* Bucket name
* Object Key path
* Event Timestamp

is included in the notification.

---

## Amazon SQS

Acts as a durable message queue.

SQS stores the event until a worker successfully processes it.

It knows nothing about images or compression—it simply stores messages.

---

## [Worker Service](../apps/worker/)

The worker continuously long-polls SQS queue.

Its responsibilities are:

* Receive SQS messages: [worker.ts](../apps/worker/src/worker.ts)
* Parse S3 event notifications: [parser.ts](../packages/shared/src/events/parser.ts#L3)
* Dispatch parsed events to handlers: [handleS3ObjectCreated](../apps/worker/src/handlers/s3-object-created.handler.ts#L4)
* Delete SQS messages after successful processing

The worker intentionally contains no image-processing logic.

---

## Handler

The handler owns the image-processing workflow.

Current responsibilities:
* Orchestrating the image workflow: [s3-object-created.handler.ts](../apps/worker/src/handlers/s3-object-created.handler.ts)

```text
Download Image

↓

Compress Image

↓

Upload Processed Image
```

Future responsibilities:

```text
Download

↓

Compress

↓

Generate Thumbnail

↓

OCR

↓

Upload

↓

Update Database
```

---

# Image Download

The handler downloads the image from S3 using:
* `GetObjectCommand` inside [s3-storage.ts](../packages/aws/src/services/s3-storage.ts#L4)

The returned object stream is converted into a Node.js `Buffer`.

```text
S3

↓

Object Stream

↓

Buffer
```

The image now exists entirely in memory.

No temporary files are created.

---

# Why Buffers?

CloudPix performs processing directly in memory.

```text
S3

↓

Buffer

↓

Sharp

↓

Buffer
```

instead of

```text
S3

↓

Temporary File

↓

Sharp

↓

Temporary File
```

Advantages:

* Lower disk I/O
* Faster processing
* Better suited for containers
* Easier deployment to ECS, Railway, Fly.io, or Lambda

---

# Sharp

CloudPix uses **[Sharp](https://github.com/lovell/sharp)** for image processing.

Sharp itself is **not** the image-processing engine.

Internally the architecture is:

```text
TypeScript

↓

Sharp

↓

libvips (C Library)

↓

CPU
```

The heavy computation is performed by **libvips**, one of the fastest image-processing libraries available.

Sharp provides a clean Node.js interface.

---

# Compression Pipeline

Current compression settings are implemented in [image.service.ts](../apps/worker/src/services/image.service.ts#L7):

```typescript
export async function compressImage(
  buffer: Buffer
): Promise<Buffer> {
  return sharp(buffer)
    .rotate()
    .resize({
      width: 1920,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({
      quality: 80,
      mozjpeg: true,
    })
    .toBuffer();
}
```

---

## What each option does

### `rotate()`

Automatically applies EXIF orientation so images taken on mobile devices appear correctly.

---

### `resize()`

```text
Maximum Width = 1920px
```

Large images are resized while maintaining aspect ratio.

Smaller images are never enlarged.

---

### JPEG Conversion

All processed images are currently converted to JPEG.

This provides better compression while simplifying downstream processing.

---

### Quality = 80

Provides a good balance between image quality and file size.

---

### `mozjpeg`

Uses Mozilla's optimized JPEG encoder for improved compression efficiency.

---

# Processing Result

Example:

```text
Original

150,997 bytes

↓

Sharp

↓

Processed

71,065 bytes
```

This represents approximately a **53% reduction** in storage size while maintaining good visual quality.

---

# Why Upload the Processed Image?

Initially, the compressed buffer only existed in memory.

The pipeline now uploads the processed image back to S3 using [uploadObject](../packages/aws/src/services/s3-storage.ts#L22) and the path resolver [getProcessedKey](../packages/shared/src/utils/key.ts#L1).

```text
originals/
    uploadId/
        image.png

↓

processed/
    uploadId/
        image.jpg
```

This allows processed media to be served independently of the original upload.

---

# Message Acknowledgement

Messages are deleted from SQS **only after** successful processing.

```text
Receive Message

↓

Process Image

↓

Upload Processed Image

↓

Delete Message
```

If processing fails:

```text
Receive Message

↓

Processing Error

↓

Message NOT Deleted

↓

Visibility Timeout

↓

Worker Receives Message Again
```

This provides **at-least-once delivery**, ensuring failed jobs can be retried.

---

# Current Processing Pipeline

```text
Receive SQS Message
        │
        ▼
Parse Event
        │
        ▼
Download Original Image
        │
        ▼
Read Metadata
        │
        ▼
Compress Image
        │
        ▼
Upload Processed Image
        │
        ▼
Delete SQS Message
```

---

# Upcoming Improvements

The next stages of the pipeline will extend the handler without changing the worker.

```text
Download
        │
        ▼
Compress
        │
        ▼
Thumbnail Generation
        │
        ▼
OCR
        │
        ▼
Upload Processed Assets
        │
        ▼
Update PostgreSQL
```

This demonstrates one of CloudPix's core architectural goals: **the worker remains a generic message consumer, while all media-specific business logic evolves inside handlers and services.**

---

## Engineering Takeaways

At this stage, CloudPix demonstrates several production-grade backend engineering concepts:

* **Event-driven architecture** using S3 Event Notifications and SQS.
* **Asynchronous processing** to keep API latency low.
* **Worker/Handler separation** following the Single Responsibility Principle.
* **In-memory media processing** using Buffers for efficiency in containerized environments.
* **Production-standard image processing** via Sharp, backed by the high-performance `libvips` library.
* **Reliable message processing** with SQS's at-least-once delivery semantics by acknowledging messages only after successful processing.

This is a significant milestone because CloudPix has moved beyond simply uploading files—it now performs real, asynchronous media transformations in a scalable and extensible way.
