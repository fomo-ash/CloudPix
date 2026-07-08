# Monorepo Development & Troubleshooting Guide

This guide documents the development workflow, workspace dependency rules, compilation pipelines, and common troubleshooting steps for the CloudPix monorepo. It is designed to help prevent and resolve issues related to TypeScript compilation, pnpm workspace resolution, and Docker image builds.

---

## 1. Monorepo Architecture Overview

This project is a monorepo managed with **pnpm workspaces** and **Turborepo**. It consists of:
*   **`apps/`**: Applications (e.g., `api`, `web`, `worker`).
*   **`packages/`**: Shared library packages (e.g., `config`, `shared`, `aws`, `env`, `database`).

Turborepo handles the task orchestrations (builds, linting, type-checking) and understands the dependency graph of these packages.

---

## 2. Workspace Dependency Rules (pnpm)

pnpm uses a strict, non-flat `node_modules` structure. 

### The Rule
> [!IMPORTANT]
> A workspace package or application **cannot** import or resolve another package (workspace-internal or external) unless it is explicitly declared in its own `package.json` under `dependencies` or `devDependencies`.

### Example Scenario
If `@cloudpix/aws` imports code from `@cloudpix/env`, you must declare it in `packages/aws/package.json`:
```json
"dependencies": {
  "@cloudpix/env": "workspace:^"
}
```
If you forget this, pnpm will not generate the symlink under `packages/aws/node_modules/@cloudpix/env`, and the TypeScript compiler (`tsc`) will fail with:
`error TS2307: Cannot find module '@cloudpix/env' or its corresponding type declarations.`

---

## 3. Compilation Dependencies and Stale Types

Shared packages inside `packages/` (such as `env` and `aws`) compile TypeScript source files (`src/`) into JavaScript files and Type Declarations inside a `dist/` directory.

### The Problem: Stale Types
Dependent packages (e.g., `@cloudpix/aws` or `@cloudpix/api`) import code from the compiled output (`dist/`) of the shared package, not from its raw TypeScript source.
If you update a shared package (e.g., adding a new environment variable to the schema in `packages/env/src/schema.ts`) but do **not** rebuild that package:
*   The generated type files (`.d.ts` files inside `packages/env/dist/`) remain outdated.
*   TypeScript compilation in dependent packages will fail because they cannot see the new changes, throwing property-not-found errors (e.g., `Property 'AWS_S3_BUCKET_NAME' does not exist on type ...`).

### The Solution: Development Workflow
Always ensure shared packages are compiled before building dependent packages. 

*   **Using Turborepo (Recommended):**
    Run the global build command from the root workspace:
    ```bash
    pnpm build
    ```
    Turborepo automatically analyzes package dependencies (configured via `dependsOn: ["^build"]` in `turbo.json`) and builds them in the correct topological order.

*   **Direct/Filtered Builds:**
    If building manually, rebuild the dependency package first, followed by the consumer:
    ```bash
    pnpm --filter @cloudpix/env build
    pnpm --filter @cloudpix/aws build
    ```

---

## 4. Docker Integration Best Practices

Multi-stage Docker builds optimized for caching must handle monorepos carefully.

### Caching vs Workspace Resolution
In the `deps` stage of application Dockerfiles, packages are installed with `pnpm install --frozen-lockfile`. 
Because pnpm workspaces resolve internal dependencies directly within the workspace:
*   All `package.json` files for all packages in the workspace must be copied *before* running `pnpm install`.
*   If a `package.json` file is omitted (e.g., forgetting to copy `packages/aws/package.json`), the install step will throw `ERR_PNPM_WORKSPACE_MISSING_DEPS`.

### Correct Dockerfile Structure
Ensure the `deps` stage copies every `package.json` in the workspace:
```dockerfile
COPY package.json .
COPY pnpm-lock.yaml .
COPY pnpm-workspace.yaml .
COPY turbo.json .

# Copy apps package.json
COPY apps/api/package.json apps/api/
COPY apps/worker/package.json apps/worker/
COPY apps/web/package.json apps/web/

# Copy all packages package.json
COPY packages/config/package.json packages/config/
COPY packages/shared/package.json packages/shared/
COPY packages/aws/package.json packages/aws/
COPY packages/env/package.json packages/env/
COPY packages/database/package.json packages/database/

RUN pnpm install --frozen-lockfile
```

---

## 5. Common Troubleshooting Guide

### Error: `error TS2688: Cannot find type definition file for 'node'.`
*   **Cause:** The compiler options require node type definitions (e.g. via `"types": ["node"]` in `tsconfig.json`), but `@types/node` is not installed or available in the path.
*   **Resolution:** Install `@types/node` in the workspace root or directly in the failing package's `devDependencies`:
    ```bash
    pnpm add -D @types/node -w
    ```

### Error: `Cannot find module '@cloudpix/...' or its corresponding type declarations.`
*   **Cause:** The shared workspace package has either not been built (the `dist/` folder is missing) or its types are stale.
*   **Resolution:** Rebuild the imported package, or run a full workspace build:
    ```bash
    pnpm --filter @cloudpix/<package-name> build
    # or
    pnpm build
    ```

### Error: `P1001: Can't reach database server at localhost:<port>`
*   **Cause:** The database container is not running or is mapped to a different port.
*   **Resolution:**
    1.  Check running containers with `docker ps` to verify the active PostgreSQL instance name and ports.
    2.  If the database service for this project (e.g. `cloudpix-postgres`) is not running, start the stack:
        ```bash
        docker compose up -d postgres
        ```
    3.  Run the Prisma migrations again:
        ```bash
        pnpm --filter @cloudpix/database run migrate --name init
        ```
