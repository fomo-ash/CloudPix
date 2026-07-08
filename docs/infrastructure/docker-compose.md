# Docker Compose

## Overview

Docker Compose orchestrates the complete local CloudPix development environment.

Running

```bash
docker compose up
```

starts the complete backend infrastructure required for local development.

---

## Current Services

| Service | Purpose |
|----------|---------|
| API | Express REST API |
| Worker | Background job processing |
| PostgreSQL | Persistent relational database |
| Redis | Caching and temporary state |

---

## Network

All services communicate through an isolated Docker bridge network.

```
cloudpix-network
```

Containers communicate using service names rather than `localhost`.

```
postgres:5432

redis:6379
```

This closely mirrors communication inside production container environments.

---

## Volumes

Persistent state is stored using Docker named volumes.

```
postgres_data

redis_data
```

Containers can be recreated without losing application data.

---

## Health Checks

Infrastructure services expose health checks.

The API and Worker only start after PostgreSQL and Redis become healthy, preventing startup race conditions.

Current health endpoints:

```
GET /health/live
GET /health/ready
```

---

## Current Status

✅ Multi-stage Docker builds

✅ API container

✅ Worker container

✅ PostgreSQL

✅ Redis

✅ Docker networking

✅ Persistent volumes

✅ Shared environment package

✅ Health checks

✅ Container startup orchestration

---

## Challenges Encountered

During implementation the following engineering challenges were resolved:

- pnpm workspace package resolution
- Multi-stage Docker build configuration
- TypeScript project references
- Shared package compilation inside Docker
- Environment validation using Zod
- Worker build artifact generation
- Docker layer caching optimization
- Container dependency ordering
- Health check orchestration
- Port mapping conflicts
- Docker networking and service discovery

---

## Port Mapping & Environment Overrides

During container orchestration, a mismatch can occur between the host port and the container's internal listening port:

1. **Host Port Configuration**: Defined in the `.env` file via `PORT` (e.g., `3100`), mapping to the container's port `3000` using `${PORT}:3000`.
2. **Container Listening Port**: The application uses the `PORT` environment variable (`env.PORT`) to determine its binding port. If `.env` is loaded directly via `env_file`, the container's `PORT` inside the container becomes `3100`.
3. **Health Check Mismatch**: The health check queries `http://localhost:3000/health/live`. If the application binds to `3100` inside the container, the health check fails, marking the container as unhealthy.

### The Solution
We override `PORT=3000` in the container's `environment` block in `docker-compose.yml`. This:
*   Forces the application inside the container to always listen on port `3000`.
*   Allows the container health check to succeed.
*   Allows you to run the application on any host port (e.g. `3100`) by setting it in your `.env` file, without affecting the container's internal port settings.

---

## Future Improvements

### Infrastructure

- AWS S3 integration
- AWS SQS integration
- Nginx reverse proxy
- Prometheus metrics
- Grafana dashboards
- Loki log aggregation

### Image Processing Pipeline

- Image upload pipeline
- OCR service integration
- PDF ingestion
- PDF compression
- Image compression
- Thumbnail generation
- Metadata extraction
- Background processing queue

### Security

- Non-root containers
- Read-only root filesystem
- OCI image labels
- Docker image vulnerability scanning
- Secret management

### Performance

- Turborepo `turbo prune`
- BuildKit cache mounts
- Smaller runtime images
- Production dependency pruning
- Optimized Docker layer caching

### Reliability

- Graceful shutdown
- Retry mechanisms
- Structured logging
- Readiness and liveness probes
- Worker health monitoring

### Development Experience

- Hot reload inside containers
- Compose profiles
- Separate development and production Compose files
- One-command local setup
- Better debugging tooling

---

## Long-Term Vision

As CloudPix evolves, Docker Compose will orchestrate the complete image-processing platform.

```
Client
    │
    ▼
API (Express)
    │
    ├────────► PostgreSQL
    │
    ├────────► Redis
    │
    ├────────► AWS S3
    │
    └────────► AWS SQS
                   │
                   ▼
              Worker Service
                   │
        ┌──────────┼──────────┐
        ▼          ▼          ▼
   OCR Engine   PDF Engine  Image Processing
```

The same container architecture will support future features such as OCR, PDF processing, image compression, metadata extraction, thumbnail generation, and asynchronous background workflows while remaining close to the production deployment architecture.