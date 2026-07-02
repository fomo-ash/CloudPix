# Routes & Controllers

## Philosophy

CloudPix follows a layered architecture.

```
Client
    │
    ▼
Routes
    │
    ▼
Controllers
    │
    ▼
Services
    │
    ▼
Repositories
    │
    ▼
Database / External Services
```

Each layer has exactly one responsibility.

---

# Routes

Routes define the HTTP interface.

Responsibilities:

- HTTP method
- URL path
- Middleware
- Controller mapping

Example

```ts
router.post("/upload", uploadImage);
```

Routes should contain **no business logic**.

---

# Controllers

Controllers coordinate a request.

Responsibilities:

- Read request data
- Validate input
- Call services
- Return responses
- Map errors to HTTP status codes

Controllers should never contain database logic.

Example

```
POST /upload

↓

Extract file

↓

Call UploadService

↓

Return Job ID
```

---

# Services

Services contain business logic.

Examples:

- UploadService
- ImageService
- OCRService
- PDFService
- CompressionService
- AnalyticsService

A service may call multiple repositories or external APIs.

---

# Repositories

Repositories are responsible for data access.

Examples

- ImageRepository
- JobRepository
- UserRepository

Responsibilities

- PostgreSQL
- Redis
- S3 metadata

No business logic belongs here.

---

# Middleware

Middleware executes before controllers.

Examples

- Authentication
- Request logging
- Rate limiting
- Validation
- Error handling

---

# Folder Structure

```
src/

controllers/

routes/

middlewares/

services/

repositories/

config/

utils/

types/

validators/
```

---

# Request Lifecycle

```
Incoming Request

↓

Express Router

↓

Middleware

↓

Controller

↓

Service

↓

Repository

↓

Database

↓

Service

↓

Controller

↓

HTTP Response
```