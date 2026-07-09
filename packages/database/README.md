# @cloudpix/database

Database access layer package for CloudPix. Wraps Prisma Client and repositories to query the PostgreSQL database.

## Directory Structure

```text
packages/database/
├── dist/                     # Compiled JS outputs (ESM)
├── generated/
│   └── client/               # Generated Prisma Client
├── prisma/
│   ├── migrations/           # Database migration files
│   └── schema.prisma         # Prisma Schema file
├── src/
│   ├── repositories/
│   │   └── asset.repository.ts # Repository for Asset operations
│   ├── index.ts              # Package entry point (exports prisma & repositories)
│   └── prisma.ts             # Prisma Client singleton
├── package.json
├── prisma.config.ts
└── tsconfig.json
```

## Available Scripts

From the repository root:

* **Generate Prisma Client**:
  ```bash
  pnpm --filter @cloudpix/database run generate
  ```
* **Run Database Migrations (Development)**:
  ```bash
  pnpm --filter @cloudpix/database run migrate --name <migration_name>
  ```
* **Build/Compile Package**:
  ```bash
  pnpm --filter @cloudpix/database build
  ```
* **Open Prisma Studio**:
  ```bash
  pnpm --filter @cloudpix/database run studio
  ```

## Development and ESM Configuration

This package is configured as a native ESM module (`"type": "module"`). When adding or editing typescript files:
* Relative imports MUST include the `.js` file extension (e.g., `import { prisma } from "./prisma.js"`).
* Imports from directory indices must target the index file explicitly (e.g., `import { PrismaClient } from "../generated/client/index.js"`).
