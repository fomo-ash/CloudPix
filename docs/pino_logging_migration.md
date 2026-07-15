# Why We Shifted to Pino Logging

As the CloudPix platform scales across multiple microservices (API, Worker, etc.), traditional `console.log()` statements become a significant bottleneck for both observability and performance. We have migrated to **Pino** as our standard logging solution.

## The Problem with `console.log`
1. **Unstructured Data**: Standard console logs are output as plain text. If the worker logs `Asset status updated to PROCESSING for uploadId: 1234`, log aggregators (like Datadog, AWS CloudWatch, or ELK) treat it as a single string. Finding all logs related to a specific `uploadId` requires slow, fragile regex parsing.
2. **Performance Overhead**: `console.log` in Node.js is surprisingly slow because it performs synchronous string formatting (`util.format`). Under heavy load, this can block the main event loop and degrade API performance.

## Why Pino?
Pino is an extremely fast, structured JSON logger.

### 1. Machine-Readable JSON Output
In production, Pino outputs raw JSON:
```json
{"level":30,"time":1617654876123,"msg":"Asset status updated to PROCESSING","uploadId":"1234","pid":4321}
```
This means log aggregators can parse the log as an object instantly. You can query your logs with explicit filters like `WHERE uploadId = '1234' AND level = 'error'`, making debugging distributed microservices dramatically faster.

### 2. High Performance
Pino uses minimum overhead techniques (like pre-allocating memory and avoiding `JSON.stringify` where possible), making it one of the fastest loggers in the Node.js ecosystem. It ensures that heavy logging won't impact our application's throughput.

### 3. Developer Experience (DX)
While raw JSON is great for machines, it's terrible for humans to read while developing locally. By integrating `pino-pretty` as a transport in non-production environments, Pino automatically intercepts the JSON and formats it into colorized, readable text in your local terminal. We get the best of both worlds!

## Implementation Standard
The Pino logger instance is maintained in `@cloudpix/shared/src/utils/logger.ts`. 
All services must import this shared instance to guarantee consistent log formatting across the entire stack.

**Bad:**
```typescript
console.log(`Processing asset ${id}`);
console.error("Failed to process", error);
```

**Good:**
```typescript
import { logger } from "@cloudpix/shared";

logger.info({ assetId: id }, "Processing asset");
logger.error({ err: error, assetId: id }, "Failed to process");
```
