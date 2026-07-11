import { env } from "@cloudpix/env";
import { startWorker } from "./worker";

async function shutdown(signal: string) {
    console.log(`Received ${signal}. Shutting down worker...`);

    process.exit(0);
}

startWorker().catch(console.error);

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));