# Troubleshooting & Developer Log

This document lists the resolved issues, environment mismatches, and build constraints encountered during local development and Docker deployment of CloudPix.

---

## 1. Prisma Schema Type Mismatch
* **Symptom**: Prisma migrate or validate commands failed with:
  ```text
  Error: Prisma schema validation - (validate wasm)
  error: Type "ImageStatus" is neither a built-in type, nor refers to another model, composite type, or enum.
  ```
* **Root Cause**: The status field of the `Asset` model was declared with the type `ImageStatus`, which was not defined in the schema. The actual enum name defined was `AssetStatus`.
* **Fix**: Updated [packages/database/prisma/schema.prisma](file:///Ubuntu/home/ashutosh/projects/Imagica/packages/database/prisma/schema.prisma) to change the status field type from `ImageStatus` to `AssetStatus`.

---

## 2. ESM Relative Import Extensions
* **Symptom**: Building `@cloudpix/database` via TypeScript compilation (`tsc`) failed with errors like:
  ```text
  Relative import paths need explicit file extensions in ECMAScript imports when '--moduleResolution' is 'node16' or 'nodenext'.
  ```
* **Root Cause**: In ESM module systems (`"type": "module"`), TS under `node16`/`nodenext` requires explicit `.js` extensions on relative imports, and index files must be imported directly (e.g. `/index.js`).
* **Fix**: 
  - Updated relative imports/exports in `packages/database/src/index.ts`, `packages/database/src/prisma.ts`, and `packages/database/src/repositories/asset.repository.ts` to include `.js` or `/index.js`.
  - Removed duplicate `prisma` instantiation in `src/index.ts` to allow it to correctly re-export the database client singleton from `src/prisma.js`.

---

## 3. Database Package Module Resolution
* **Symptom**: Other workspaces (like `@cloudpix/api`) failed to compile with:
  ```text
  Cannot find module '@cloudpix/database' or its corresponding type declarations.
  ```
* **Root Cause**: Since `@cloudpix/database` tsconfig is set to `"rootDir": "."` (to encompass the generated files directory), files compile inside `dist/src/...` instead of directly under `dist/`. The database package `package.json` was pointing `"main"` and `"types"` to `dist/index.js`, which did not exist.
* **Fix**: Updated [packages/database/package.json](file:///Ubuntu/home/ashutosh/projects/Imagica/packages/database/package.json) to reference:
  ```json
  "main": "dist/src/index.js",
  "types": "dist/src/index.d.ts"
  ```
  And ran `pnpm install` at the workspace root to rebuild symbolic references.

---

## 4. Local Database Connection Credentials Mismatch
* **Symptom**: Database migration failed with:
  ```text
  Error: P1000: Authentication failed against database server, the provided database credentials for cloudpix are not valid.
  ```
* **Root Cause**: The `.env` file was updated to connect using `cloudpix:cloudpix` credentials, but the Postgres container was previously initialized and ran with the default credentials `postgres:postgres`. The Postgres Docker volume persists user credentials once initialized, so updating `.env` environment variables does not update the database volume logins.
* **Fix**: Cleaned up existing Docker volumes and forced Postgres to re-initialize with the new `.env` settings:
  ```bash
  docker compose down -v
  docker compose up -d
  ```

---

## 5. Prisma Runtime Binary Mismatch in Alpine Containers
* **Symptom**: The `cloudpix-api` container was crashing at startup with the error:
  ```text
  Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/app/packages/database/dist/generated/client/index.js' imported from /app/packages/database/dist/src/prisma.js
  ```
  Followed by:
  ```text
  PrismaClientInitializationError: Prisma Client could not locate the Query Engine for runtime "linux-musl-openssl-3.0.x".
  This happened because Prisma Client was generated for "debian-openssl-3.0.x", but the actual deployment required "linux-musl-openssl-3.0.x".
  ```
* **Root Cause**: The client was pre-generated on the host (which runs WSL Ubuntu / Debian). Since `dist` is ignored in `.dockerignore`, the Docker build compiles the database package inside Alpine container, but it was copying the host's client folder containing the Debian binary, failing to find the correct musl engine library at runtime.
* **Fix**: Set up Prisma generation to run natively inside the Docker container builds:
  1. Updated [api.Dockerfile](file:///Ubuntu/home/ashutosh/projects/Imagica/infra/docker/api.Dockerfile) and [worker.Dockerfile](file:///Ubuntu/home/ashutosh/projects/Imagica/infra/docker/worker.Dockerfile) to run `pnpm --filter @cloudpix/database run generate` inside the container build process (mocking `DATABASE_URL` and `DIRECT_URL` during generate to satisfy `prisma.config.ts` validations).
  2. Changed manual compile steps to Turborepo commands (`RUN npx turbo run build --filter=@cloudpix/api`) so dependencies are built in the correct order, placing the compiled output and the newly generated Alpine client under the `dist/` directory.
  3. Added a step in [packages/database/package.json](file:///Ubuntu/home/ashutosh/projects/Imagica/packages/database/package.json) to copy the generated client into `dist/` so it is resolvable relative to `dist/src/prisma.js`:
     ```json
     "build": "tsc -p tsconfig.json && cp -r generated dist/"
     ```

---

## 6. Host vs Container-First Database Integration (Shifting to "Everything Docker")

### Why We Shifted
Initially, we attempted to keep the connection URL in `.env` configured for the local host (`localhost:5435`) and dynamically rewrite it inside the database package code at runtime when running in Docker. While this patch worked temporarily, it is an anti-pattern because:
* It litters the codebase with environment-specific string manipulation hacks.
* It makes the codebase harder to scale or deploy to staging/production.

By switching to **"Everything Docker" (Container-First)**, we keep our environment variables clean, our codebase standard, and align our local development environment with production container practices.

### Host vs Docker Network Migration Workflows

| Metric | Running Migrations on Host (Local Prisma) | Running Migrations on Docker Network (Container-First) [Standard] |
| :--- | :--- | :--- |
| **Command** | `pnpm --filter @cloudpix/database run migrate` | `docker compose exec api pnpm --filter @cloudpix/database run migrate` |
| **Host Context** | Connected to `localhost:5435` | Connected to `postgres:5432` (inside Docker network namespace) |
| **Port Exposure** | Requires exposing PostgreSQL container port `5435` to the host | Does not require exposing database ports outside the container network |
| **Environment** | Relies on local Node/Prisma versions on the host machine | Guarantees identical Node/Prisma/OS runtime version inside the container |
| **Security** | Vulnerable if database ports are exposed to external host networks | Highly secure; database remains isolated within the container network |

### Why Container-First is the Production Standard
1. **Network Isolation & Security**: In staging and production environments, databases are placed inside secure private subnets (VPCs) and never exposed to the public internet. Running migrations from a container inside the same private network namespace is highly secure and prevents exposing database port entrypoints.
2. **Deterministic Runtimes**: Dev machines running different versions of Node, npm, or system architectures can cause silent build mismatches. Running commands inside the container guarantees the database layer matches exactly what will run in production.
3. **CI/CD Compatibility**: Continuous deployment pipelines build and run tasks inside isolated container executors. Adopting a container-first command structure locally ensures your automation pipelines run identical commands.
