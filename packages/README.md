# Packages

## Overview

The `packages/` directory contains reusable libraries shared across multiple applications in the CloudPix monorepo.

Unlike the applications inside `apps/`, packages are **not independently deployable services**. Instead, they provide shared functionality, configuration, and abstractions used throughout the platform.

This approach promotes:

- Code reuse
- Consistent engineering standards
- Strong type safety
- Easier maintenance
- Reduced duplication

---

# Current Packages

## config/

Shared engineering configuration for the entire repository.

Responsibilities:

- Shared TypeScript configuration
- Shared ESLint configuration
- Shared Prettier configuration
- Future shared tooling configuration

This package ensures every application follows the same development standards.

---

## shared/

Shared code used across multiple services.

Current structure:

```
shared/
├── constants/
├── errors/
├── types/
├── utils/
├── validators/
└── index.ts
```

Future responsibilities include:

- Shared TypeScript types
- Error classes
- Validation schemas
- Utility functions
- Constants
- DTOs
- Queue names
- Redis keys
- API contracts

---

# Dependency Rules

Packages may depend on other packages.

Applications may depend on packages.

Packages should **never** depend on applications.

```
apps
   │
   ▼
packages

✓ Allowed

packages
   │
   ▼
apps

✗ Not Allowed
```

This keeps the dependency graph clean and prevents circular dependencies.

---

# Design Principles

Every package should:

- Have a single responsibility.
- Expose a clear public API through `index.ts`.
- Avoid unnecessary dependencies.
- Be independently buildable.
- Be reusable across multiple applications.

---

# Future Packages

As CloudPix grows, additional packages may be introduced.

Examples:

```
packages/
├── database/
├── auth/
├── logger/
├── storage/
├── queue/
├── telemetry/
└── testing/
```

These will be extracted only when they provide meaningful reuse across services.

---

# Philosophy

Applications implement business logic.

Packages provide reusable building blocks.

Keeping these concerns separate results in a more maintainable and scalable codebase.