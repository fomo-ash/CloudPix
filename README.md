# CloudPix

CloudPix is a production-grade, event-driven image processing platform built to demonstrate scalable backend architecture and modern cloud-native engineering practices.

The project is designed as a portfolio-grade backend system inspired by architectures used at companies such as Amazon, Netflix, Uber, Cloudflare, and Stripe.

---

## Project Goals

CloudPix aims to provide a scalable pipeline for processing user-uploaded images.

* Production-grade backend architecture
* Event-driven processing
* Containerized development environment
* Distributed system design
* AWS-native infrastructure
* Image resizing, optimization, and compression
* Format-aware output handling (JPEG, PNG, WebP)
* OCR

Future capabilities include:

* Video transcoding (FFmpeg)
* AI image captioning
* NSFW detection
* Background remova
* Duplicate image detection
* Analytics dashboard

---

## Image Processing & Status Lifecycle

CloudPix features a fully automated, format-aware image processing pipeline running inside containerized workers:

### 1. Format-Aware Compression
The worker service parses input image metadata dynamically using `sharp` and outputs optimized versions matching the input:
* **PNG:** Optimized using palette compression (`compressionLevel: 9`).
* **WebP:** Compressed using lossy compression (`quality: 80`).
* **JPEG:** Compressed using `mozjpeg` algorithms (`quality: 80`).
* **Fallback:** Non-web formats fallback to high-quality optimized `jpeg`.

### 2. Asset Lifecycle States
All user-uploaded assets synchronize their state within a central PostgreSQL database through Prisma:
* `UPLOADED`: Client requested a presigned upload URL, waiting for S3 upload.
* `PROCESSING`: SQS message received, worker is actively downloading and compressing the image.
* `COMPLETED`: Processing succeeded; compressed image uploaded back to S3, and `processedKey` database entry is updated.
* `FAILED`: Processing failed at any step (automatically handled to update status to `FAILED` for full observability).

---

## High-Level Architecture

```text
Client (Next.js)
        │
        ▼
API Service (Express)
        │
Authentication (JWT)
        │
Generate Pre-signed URL
        │
Amazon S3
        │
Object Created Event
        │
Amazon SQS
        │
Worker Service
        │
Sharp
        │
Processed S3 Bucket
        │
PostgreSQL
        │
Redis
        │
CloudFront CDN
        │
End User
```

---

## Tech Stack

### Backend

* Node.js
* TypeScript
* Express

### Frontend

* Next.js

### Storage

* Amazon S3

### Queue

* Amazon SQS

### Database

* PostgreSQL
* Prisma ORM

### Cache

* Redis

### Image Processing

* Sharp

### Infrastructure

* Docker
* Docker Compose
* Nginx

### Authentication

* JWT
* Refresh Tokens

### Monitoring & Logging

* Prometheus
* Grafana
* Loki
* Winston

### Deployment

* AWS

### CI/CD

* GitHub Actions

---

## Repository Structure

```text
cloudpix/
│
├── apps/
│   ├── api/
│   ├── worker/
│   └── web/
│
├── packages/
│   ├── shared/
│   └── config/
│
├── infra/
│   ├── docker/
│   └── nginx/
│
├── docs/
│
├── scripts/
│
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── README.md
```

---

## Development Principles

This project follows modern backend engineering practices:

* Monorepo architecture with pnpm workspaces
* Turborepo for build orchestration
* Docker-first development
* Event-driven architecture
* Stateless services
* Infrastructure as Code
* Shared packages for reusable logic
* Production-oriented folder organization

---

## Learning Objectives

This project is being built to understand and implement:

* Distributed systems
* Event-driven architecture
* Docker and container orchestration
* Backend scalability
* Cloud-native development
* AWS services
* Production deployment
* Monitoring and observability
* CI/CD pipelines

---

## License

This project is intended for educational and portfolio purposes.
