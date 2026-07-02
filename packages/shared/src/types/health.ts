export interface HealthChecks {
    postgres: boolean;
    redis: boolean;
}

export interface HealthResponse {
    status: "alive" | "ready" | "not ready";
    service: string;
    timestamp: string;
    checks?: HealthChecks;
}