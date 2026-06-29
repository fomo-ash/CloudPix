# CloudPix

CloudPix is a production-grade, event-driven image processing platform built to demonstrate scalable backend architecture and modern cloud-native engineering practices.

The project is designed as a portfolio-grade backend system inspired by architectures used at companies such as Amazon, Netflix, Uber, Cloudflare, and Stripe.

---

## Project Goals

CloudPix aims to provide a scalable pipeline for processing user-uploaded images.

Current focus:

* Production-grade backend architecture
* Event-driven processing
* Containerized development environment
* Distributed system design
* AWS-native infrastructure

Future capabilities include:

* Image resizing and optimization
* Multiple output formats (WebP, AVIF, JPEG)
* Video transcoding (FFmpeg)
* OCR
* AI image captioning
* NSFW detection
* Background removal
* Duplicate image detection
* Analytics dashboard

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
