import { Request, Response } from "express";

import {
    HealthChecks,
    HealthResponse,
} from "@cloudpix/shared";

export const liveness = (_req: Request, res: Response): void => {
    const response: HealthResponse = {
        status: "alive",
        service: "cloudpix-api",
        timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
};

export const readiness = async (
    _req: Request,
    res: Response
): Promise<void> => {
    // TODO: Replace with actual health checks
    // await prisma.$queryRaw`SELECT 1`
    // await redis.ping()

    const checks: HealthChecks = {
        postgres: true,
        redis: true,
    };

    const ready = Object.values(checks).every(Boolean);

    const response: HealthResponse = {
        status: ready ? "ready" : "not ready",
        service: "cloudpix-api",
        timestamp: new Date().toISOString(),
        checks,
    };

    res.status(ready ? 200 : 503).json(response);
};