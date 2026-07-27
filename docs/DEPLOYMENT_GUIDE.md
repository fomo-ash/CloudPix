# CloudPix Deployment Guide

This document details the production deployment architecture and configuration for the CloudPix Turborepo. The goal was to deploy a highly scalable, event-driven architecture using **100% free-tier services** by cleverly combining resources.

## 🏗 Architecture Overview

- **Frontend:** Deployed to **Vercel** (Next.js)
- **Backend (API & Worker):** Deployed to **Render** (Node.js) on a single Free Tier instance.
- **Database:** Hosted on **Neon** (Serverless PostgreSQL)
- **Storage & Queues:** Handled by **AWS** (S3 and SQS)

---

## 1. Backend Deployment (Render)

Because Render's free tier only allows one active web service, we deployed both the Express API and the Background Worker into a **single unified container**.

### Configuration Highlights:
- **Infrastructure as Code (`render.yaml`):** The entire Render deployment is managed via the `render.yaml` blueprint at the root of the project.
- **Dependency Resolution:** By default, Render prunes `devDependencies` before the build script runs. We bypassed this by prefixing the build command with `NODE_ENV=development pnpm install` to ensure Turborepo and TypeScript are available for compilation.
- **Prisma Fixes:** We removed the highly experimental `prisma.config.ts` from `packages/database`. This reverted Prisma to its standard, battle-tested behavior, allowing `prisma generate` to run successfully in CI/CD without needing dummy `DATABASE_URL` placeholders.
- **CommonJS Interop:** We removed `"type": "module"` from the database package so it compiles to CommonJS natively, preventing `is not a constructor` runtime crashes when the Express API imports classes from the database package.

### The Unified Start Command
To run both the API and Worker for free, the `render.yaml` uses Bash concurrency in its start command:
```bash
node apps/api/dist/server.js & node apps/worker/dist/index.js & wait -n
```
*This launches both node processes simultaneously and ensures the container crashes and restarts if either one fails.*

---

## 2. Frontend Deployment (Vercel)

The Next.js frontend (`apps/web`) is deployed seamlessly on Vercel.

### Turborepo Environment Variable Isolation
Turborepo has a strict security feature that hides environment variables from Next.js builds unless they are explicitly whitelisted. 
Because Vercel builds via Turborepo, the `BACKEND_URL` was originally being stripped out, causing `502 Bad Gateway` errors.

**The Fix:**
We added `"globalEnv": ["BACKEND_URL"]` to `turbo.json`. This tells Turborepo to allow Vercel to inject the Render backend URL directly into the Next.js API proxy (`next.config.ts`).

### Vercel Required Environment Variables
- `BACKEND_URL`: The live URL of the Render service (e.g., `https://cloudpix-backend-xxxx.onrender.com`).
- `NEXT_PUBLIC_S3_URL`: The public URL to your S3 bucket.

---

## 3. AWS Infrastructure Configuration

Because the AWS resources were created manually via the console rather than CDK/Terraform, three critical configurations are required to wire the event-driven pipeline together.

### A. S3 CORS Policy (Crucial for Frontend Uploads)
By default, Amazon S3 blocks browsers from uploading files directly via presigned URLs. To fix the `S3 upload failed` network errors, the bucket's CORS policy must be explicitly defined:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["PUT", "POST", "DELETE", "GET", "HEAD"],
        "AllowedOrigins": [
            "http://localhost:3000",
            "http://localhost:3001",
            "https://your-vercel-domain.vercel.app"
        ],
        "ExposeHeaders": []
    }
]
```

### B. SQS Access Policy
The SQS queue must have a permission policy that allows the S3 bucket to publish messages to it. Without this, S3 notifications will fail silently.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "s3.amazonaws.com" },
      "Action": "SQS:SendMessage",
      "Resource": "arn:aws:sqs:<REGION>:<ACCOUNT_ID>:<QUEUE_NAME>",
      "Condition": {
        "ArnEquals": {
          "aws:SourceArn": "arn:aws:s3:::<BUCKET_NAME>"
        }
      }
    }
  ]
}
```

### C. S3 Event Notifications
To trigger the SQS queue, an Event Notification is configured on the S3 bucket:
- **Event Type:** `s3:ObjectCreated:*`
- **Destination:** The SQS Queue
- **Prefix Filter:** `original/` *(Must exactly match the `S3_ORIGINAL_PREFIX` environment variable used by the backend, or the event will be silently dropped).*
