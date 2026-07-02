
# @cloudpix/env

## Overview

`@cloudpix/env` provides centralized runtime configuration for every backend service in CloudPix.

Instead of reading `process.env` throughout the codebase, every service imports a validated and strongly typed configuration object.

```ts
import { env } from "@cloudpix/env";
```

---

## Why?

Using `process.env` directly introduces several problems:

- Missing environment variables are only discovered at runtime.
- Environment values are always strings.
- No centralized validation.
- Configuration logic becomes duplicated across services.

`@cloudpix/env` solves these issues by validating the environment during application startup.

If required variables are missing or invalid, the application exits immediately.

---

## Responsibilities

This package is responsible for:

- Loading environment variables
- Runtime validation using Zod
- Exporting a typed configuration object

This package is **not** responsible for:

- TypeScript configuration
- ESLint configuration
- Prettier configuration
- Business logic

---

## Folder Structure

src/
├── schema.ts
├── env.ts
└── index.ts

---

## Adding a New Environment Variable

1. Add the variable to `schema.ts`
2. Update `.env.example`
3. Use the exported `env` object

Never access `process.env` directly inside application code.

---

## Future Improvements

- Environment-specific schemas
- Secret manager integration
- AWS Parameter Store
- AWS Secrets Manager
- HashiCorp Vault support