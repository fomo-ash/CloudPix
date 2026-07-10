# CloudPix Backend System Design

## Vision

CloudPix is an event-driven media processing platform.

Initially it supports image compression.

Over time it expands into:

- Image optimization
- OCR
- PDF processing
- Metadata extraction
- AI image tagging
- Background processing

---

# High Level Architecture

```
                    Client

                      │

            HTTPS REST API

                      │

              Express API

        ┌────────┼─────────┐

        ▼        ▼         ▼

   PostgreSQL   Redis     AWS

                         S3 + SQS

                            │

                            ▼

                     Worker Service

        ┌────────────┼──────────────┐

        ▼            ▼              ▼

   Compression      OCR         PDF Engine
```

---

# Backend Components

## API

Responsibilities

- Authentication
- Uploads
- Metadata
- Jobs
- Dashboard
- Analytics

Never performs heavy processing.

---

## Worker

Responsible for

- Compression
- OCR
- PDF
- AI
- Metadata extraction

Runs asynchronously.

For a detailed deep-dive, see the [Worker and SQS Integration documentation](file:///Ubuntu/home/ashutosh/projects/Imagica/docs/backend/worker-and-sqs-integration.md).

---

## PostgreSQL

Stores

- Users
- Jobs
- Images
- Metadata
- Processing status
- Analytics

---

## Redis

Stores

- Cache
- Rate limits
- Sessions
- Temporary jobs

---

## AWS S3

Stores

- Original images
- Compressed images
- PDFs
- OCR outputs
- Generated thumbnails

---

## AWS SQS

Decouples

API

↓

Worker

---

# Upload Flow

```
Client

↓

POST /upload

↓

API

↓

Upload original image to S3

↓

Create Job in PostgreSQL

↓

Publish SQS message

↓

Return Job ID

↓

Worker consumes message

↓

Download image

↓

Compress

↓

Upload result

↓

Update PostgreSQL

↓

Client polls Job API
```

---

# OCR Flow

```
Image

↓

Worker

↓

OCR Engine

↓

Extract text

↓

Save JSON

↓

Return
```

---

# PDF Flow

```
PDF

↓

Split pages

↓

OCR

↓

Compress

↓

Merge

↓

Store

↓

Complete
```

---

# Future AI Pipeline

```
Image

↓

YOLO

↓

SAM

↓

LLM

↓

Caption

↓

Tags

↓

Metadata

↓

Search Index
```

---

# Scaling Strategy

API

Horizontal

Worker

Horizontal

Redis

Managed

PostgreSQL

RDS

S3

Unlimited

SQS

Managed