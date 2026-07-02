import { env } from "@cloudpix/env";

console.log("CloudPix Worker started.");

const heartbeat = setInterval(() => {
    console.log("Worker alive...");
}, 10000);

async function shutdown(signal: string) {
    console.log(`Received ${signal}. Shutting down worker...`);

    clearInterval(heartbeat);

    process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));