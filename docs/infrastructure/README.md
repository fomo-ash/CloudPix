# Docker Infrastructure

## Overview

CloudPix follows a **Docker-first** development philosophy.

Every backend service runs inside an isolated container. Developers are not required to install PostgreSQL, Redis, or other infrastructure dependencies directly on their machines.

The local development environment mirrors the production architecture as closely as possible while remaining lightweight and reproducible.

---

# Why Docker?

Docker provides:

* Consistent development environments
* Platform-independent builds
* Reproducible deployments
* Isolated services
* Simplified onboarding

Instead of relying on software installed on the host machine, every dependency is packaged inside containers.

A new developer should be able to start the complete backend stack using a single command:

```bash
docker compose up
```

---

# Infrastructure Philosophy

CloudPix follows the principle of **one responsibility per container**.

Each service performs a single well-defined task.

| Container             | Responsibility                                 |
| --------------------- | ---------------------------------------------- |
| API                   | Accept HTTP requests and expose REST endpoints |
| Worker                | Process asynchronous image jobs                |
| PostgreSQL            | Persistent relational database                 |
| Redis                 | Cache and temporary state                      |
| LocalStack            | Local AWS emulation (S3 + SQS)                 |
| Nginx *(future)*      | Reverse proxy                                  |
| Prometheus *(future)* | Metrics collection                             |
| Grafana *(future)*    | Dashboards                                     |
| Loki *(future)*       | Log aggregation                                |

---

# Local Development Architecture

```text
                    Docker Network
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│                     API (Express)                                    │
│                           │                                          │
│      ┌────────────────────┼────────────────────┐                     │
│      ▼                    ▼                    ▼                     │
│ PostgreSQL             Redis             LocalStack                  │
│                                              │                       │
│                                        S3 + SQS                      │
│                                              │                       │
│                                              ▼                       │
│                                          Worker                      │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

# Container Communication

Containers communicate over an internal Docker bridge network.

Services use Docker DNS instead of `localhost`.

Examples:

```text
postgres:5432
redis:6379
localstack:4566
```

The API connects to PostgreSQL using `postgres`, not `localhost`.

---

# Persistent Volumes

CloudPix uses Docker named volumes for stateful services.

Examples:

* postgres_data
* redis_data
* localstack_data

Containers can be recreated without losing persistent data.

---

# Docker Build Strategy

CloudPix uses a **multi-stage Docker build** for application services.

The build pipeline consists of four stages:

1. Base
2. Depdendencies
3. Builder
4. Runner

This minimizes image size while maximizing Docker layer caching.

---

## Stage 1 – Base

Responsible for:

* Node.js runtime
* pnpm
* shared dependencies
* working directory

---

## Stage 2 – Pruner

Uses Turborepo to create a minimal workspace for the target application.

```bash
turbo prune api --docker
```

This removes unnecessary applications from later build stages.

---

## Stage 3 – Installer

Installs dependencies using only package manifests.

This allows Docker to reuse cached dependency layers when application source code changes.

---

## Stage 4 – Runner

The final production image.

Only compiled application artifacts and runtime dependencies are copied into this image.

Development tooling, source files, and unnecessary packages are excluded.

---

# Docker Layer Caching

Docker caches every instruction in a Dockerfile.

CloudPix intentionally orders Docker instructions to maximize cache reuse.

Typical order:

1. Copy package manifests
2. Install dependencies
3. Copy source code
4. Build application

This prevents dependency installation from running on every source code change.

---

# Why Not Install Services Locally?

CloudPix intentionally avoids requiring developers to install infrastructure services directly.

Reasons include:

* Consistent environments
* Easier onboarding
* Version consistency
* Cleaner development workflow
* Better parity with production

---

# Future Infrastructure

The Docker environment will gradually expand to include:

* Nginx
* Prometheus
* Grafana
* Loki
* OpenTelemetry Collector
* Jaeger (optional)
* MinIO (optional experimentation)

The architecture has been designed to accommodate these services without requiring significant restructuring.

---

# References

* Docker
* Docker Compose
* Turborepo
* pnpm
* Node.js
* LocalStack

# Current Status

The API service has been successfully containerized using a multi-stage Docker build.

Completed milestones include:

- Docker-first project structure
- Multi-stage Docker image
- Express API container
- Shared TypeScript configuration
- pnpm workspace integration
- Turborepo integration
- Health check endpoint
- Successful Docker image build
- Successful container execution
- API verification using Postman

The infrastructure currently consists of a single containerized API service. Additional infrastructure components will be integrated incrementally.

# Challenges Faced

During the Dockerization process several real-world engineering issues were encountered and resolved.

## Workspace Package Resolution

Initially, the Docker build failed because the pnpm workspace contained placeholder packages with empty `package.json` files.

Resolution:

- Created valid workspace manifests.
- Standardized package naming.
- Removed unused Turborepo starter packages.

---

## Turborepo Starter Cleanup

The project was originally bootstrapped using `create-turbo`.

Several starter packages (`docs`, `ui`, `eslint-config`, `typescript-config`) were removed to simplify the repository and align it with CloudPix's architecture.

---

## TypeScript Configuration

The shared TypeScript configuration initially generated declaration files for application packages, resulting in build issues inside Docker.

Resolution:

- Application-specific compiler overrides were introduced.
- The API package now builds correctly inside Docker.

---

## Docker Build Context

The first Dockerfile attempted to optimize workspace copying too early.

Resolution:

- Switched to a simpler and more reliable build strategy by copying the full repository during the build stage.
- Future optimization will reintroduce selective copying using Turborepo.

---

## Multi-stage Build Debugging

Several Docker-specific issues were encountered including:

- Empty Dockerfile
- Incorrect stage naming
- Workspace dependency resolution
- Build context issues
- pnpm activation inside runner stage

Each issue was resolved incrementally while validating every stage independently.

# Lessons Learned

This milestone emphasized several important backend engineering principles:

- Correctness before optimization.
- Infrastructure should be built incrementally.
- Docker build caching depends heavily on layer ordering.
- Monorepos require careful workspace configuration.
- Multi-stage Dockerfiles are easier to debug when introduced gradually.
- Local builds should always succeed before debugging Docker builds.


# Planned Improvements

The current Docker implementation prioritizes correctness and reproducibility.

Future iterations will introduce several production optimizations.

## Build Optimizations

- Turborepo `turbo prune`
- Docker BuildKit cache mounts
- Smaller runtime images
- Production-only dependency installation

---

## Security

- Non-root container user
- Read-only filesystem where applicable
- Image vulnerability scanning
- Minimal runtime image

---

## Runtime Improvements

- Docker HEALTHCHECK instruction
- Graceful shutdown handling
- Proper signal forwarding
- Environment validation

---

## Observability

- Structured logging
- OpenTelemetry instrumentation
- Prometheus metrics endpoint
- Distributed tracing

---

## Infrastructure

- Docker Compose
- PostgreSQL
- Redis
- LocalStack (S3 + SQS)
- Internal Docker networking

---

## CI/CD

- GitHub Actions
- Automated Docker builds
- Image publishing
- Security scanning
