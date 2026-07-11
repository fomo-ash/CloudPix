# CloudPix Architecture (Current)

## Overview

CloudPix is an **event-driven media processing backend**.

Unlike a traditional upload API, the API never performs heavy image processing.

Instead, it delegates processing to an asynchronous worker using AWS S3 and SQS.

This provides:

* Better scalability
* Faster API responses
* Separation of concerns
* Independent scaling of API and workers
* Extensible processing pipeline

---

# Current System Architecture

```text
                        Client
                           │
                           │ POST /upload/presigned-url
                           ▼
                   Express API
                           │
              Create Asset in PostgreSQL
                           │
              Generate Presigned Upload URL
                           ▼
                 Upload directly to S3
                           │
                           ▼
               S3 Bucket (cloudpix-dev-ashutosh)
                           │
                 originals/<uuid>/<filename>
                           │
          ObjectCreated Event Notification
                           ▼
                      AWS SQS Queue
                           │
                 Long Poll (Worker)
                           ▼
                Parse S3 Event Payload
                           ▼
            handleS3ObjectCreated(event)
                           │
                           ▼
               Download Original Image
                           │
                           ▼
                    Buffer in Memory
```

At this stage the image is successfully downloaded into memory but is **not yet processed**.

---

# Why Direct Uploads?

Instead of sending images through the backend:

```text
Client
    │
    ▼
Express API
    │
    ▼
S3
```

CloudPix uses:

```text
Client
    │
Request Upload URL
    │
    ▼
Express API
    │
Generate Presigned URL
    ▼
Client
    │
Upload directly
    ▼
S3
```

### Advantages

* API bandwidth remains low.
* API responds quickly.
* Large files never pass through the backend.
* Scales significantly better.

---

# Why S3 Events?

Once the upload completes:

```text
S3
│
▼
ObjectCreated
```

S3 automatically emits an event.

The API doesn't need to notify the worker.

No polling.

No cron jobs.

No manual triggers.

AWS handles event generation.

---

# Why SQS?

SQS decouples uploads from processing.

Without SQS:

```text
Upload

↓

Compress

↓

OCR

↓

Thumbnail

↓

Response
```

The client waits for everything.

---

With SQS:

```text
Upload

↓

Response immediately

↓

Worker processes asynchronously
```

The upload finishes quickly while heavy work happens in the background.

---

# Current Worker Architecture

The worker is intentionally small.

It does **not** contain image-processing logic.

Its responsibilities are only:

```text
Receive Message

↓

Parse Event

↓

Dispatch Handler

↓

Delete Message
```

The worker knows **nothing** about:

* Sharp
* OCR
* PostgreSQL
* AI

This keeps it generic.

---

# Why Handlers?

Instead of this:

```text
Worker

↓

Download

↓

Compress

↓

OCR

↓

Upload

↓

Database
```

CloudPix uses:

```text
Worker

↓

handleS3ObjectCreated()

↓

Download

↓

Compress

↓

OCR

↓

Upload

↓

Database
```

The handler owns the business workflow.

The worker only routes events.

This follows the same philosophy as the API:

```text
Route

↓

Controller

↓

Service

↓

Repository
```

Instead of HTTP requests, we're routing **events**.

---

# Current Package Responsibilities

## [API Package](../apps/api/)

Responsible for:

* HTTP requests
* Input Validation
* Asset metadata creation
* Presigned URLs generation via service layer

Never processes images.

---

## [AWS Package](../packages/aws/)

Responsible for interacting with AWS.

Contains:

* S3 client connection: [s3.client.ts](../packages/aws/src/clients/s3.client.ts)
* SQS client connection: [sqs.client.ts](../packages/aws/src/clients/sqs.client.ts)
* Presigned URL generation: [s3.service.ts](../packages/aws/src/services/s3.service.ts)
* Receive SQS messages: [receiveMessages](../packages/aws/src/services/sqs.service.ts#L5)
* Delete SQS messages: [deleteMessage](../packages/aws/src/services/sqs.service.ts#L17)
* Download S3 objects: [downloadObject](../packages/aws/src/services/s3-storage.ts#L4)

The rest of the application never talks directly to the AWS SDK.

---

## [Shared Package](../packages/shared/)

Responsible for common contracts.

Contains:

* DTOs and API interfaces: [types/api.ts](../packages/shared/src/types/api.ts)
* Shared Upload type declarations: [types/upload.ts](../packages/shared/src/types/upload.ts)
* S3 event payloads parser: [parseS3Event](../packages/shared/src/events/parser.ts#L3)
* S3 Event structure interfaces: [s3-event.ts](../packages/shared/src/events/s3-event.ts)

This prevents duplication between API and worker.

---

## [Worker Package](../apps/worker/)

Responsible for:

* Long polling SQS queue: [worker.ts](../apps/worker/src/worker.ts)
* Parsing raw SQS bodies into S3 events
* Dispatching events to registered handlers
* Acknowledging (deleting) processed SQS messages

Nothing else.

---

## Handler

Currently responsible for:

* Downloading Image: [handleS3ObjectCreated](../apps/worker/src/handlers/s3-object-created.handler.ts#L4)

Future responsibilities:

```text
Download

↓

Compress

↓

Thumbnail

↓

OCR

↓

Upload

↓

Update Database
```

---

# Current Image Flow

```text
Client
    │
Upload Image
    ▼
S3
    │
ObjectCreated
    ▼
SQS
    │
Receive
    ▼
Worker
    │
Dispatch
    ▼
Image Handler
    │
Download
    ▼
Buffer
```

For details on image compression, metadata parsing, and buffer handling, see the [Media Processing Pipeline documentation](media-processing.md).

---

# Why Buffers Instead of Temporary Files?

CloudPix downloads images directly into memory.

```text
S3

↓

Buffer

↓

Sharp
```

Instead of:

```text
S3

↓

/tmp/image.png

↓

Sharp
```

Advantages:

* No temporary files
* Less disk I/O
* Better suited for containers
* Easier deployment to ECS, Railway, Fly.io, or serverless environments

---

# Processing Pipeline (Upcoming)

The next stages will extend the handler.

```text
Download Image
        │
        ▼
Compress (Sharp)
        │
        ▼
Generate Thumbnail
        │
        ▼
Upload Processed Images
        │
        ▼
Update Asset Record
```

Notice that the **worker will not change**.

Only the handler evolves.

---

# Planned V1 Final Architecture

```text
                        Client
                           │
                           ▼
                  Express API
                           │
               Generate Presigned URL
                           ▼
                        AWS S3
                           │
             ObjectCreated Notification
                           ▼
                         AWS SQS
                           │
                    Worker Service
                           │
              handleS3ObjectCreated()
                           │
        ┌──────────────────┼─────────────────┐
        │                  │                 │
        ▼                  ▼                 ▼
 Download Image      Sharp Compress     Thumbnail
        │
        ▼
        OCR
        │
        ▼
 Upload Processed Files
        │
        ▼
 Update PostgreSQL
```

---

# Future Architecture (Post V1)

Because the worker only dispatches events, new processing stages can be added without changing the worker itself.

```text
Image Upload
      │
      ▼
Image Handler
      │
      ├── Compression
      ├── Thumbnail
      ├── OCR
      ├── AI Captioning
      ├── NSFW Detection
      ├── Duplicate Detection
      └── Watermarking
```

Eventually additional handlers can be introduced:

```text
Worker
│
├── Image Handler
├── Video Handler
├── PDF Handler
└── Audio Handler
```

The worker remains unchanged—it simply routes events to the appropriate workflow.

---

# Design Principles Followed

* **Event-driven architecture**: Uploads emit events instead of triggering synchronous processing.
* **Single Responsibility Principle**: Each layer has one job—API handles requests, worker handles messages, handlers execute workflows, AWS package wraps SDK calls.
* **Separation of concerns**: Infrastructure code is isolated from business logic.
* **Incremental verification**: Each milestone (S3 upload, SQS event, worker consumption, S3 download) was independently validated before adding the next feature.
* **Extensibility**: New processing stages are added inside handlers without changing the message-consumption layer.

---

## Where We Are Today

```text
✅ Infrastructure
✅ Docker
✅ Monorepo
✅ PostgreSQL
✅ Redis
✅ Presigned Uploads
✅ S3 Integration
✅ S3 → SQS Events
✅ Worker Long Polling
✅ Event Parsing
✅ Image Download
⬜ Sharp Compression
⬜ Thumbnail Generation
⬜ Upload Processed Images
⬜ Database Update
⬜ OCR
```
