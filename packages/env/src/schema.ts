import { z } from "zod";

export const envSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

    PORT: z.coerce.number().default(3100),

    DATABASE_URL: z.string(),

    REDIS_URL: z.string(),

    S3_ORIGINAL_BUCKET: z.string(),

    S3_PROCESSED_BUCKET: z.string(),

    SQS_IMAGE_QUEUE: z.string(),

    AWS_REGION: z.string(),

    AWS_ACCESS_KEY_ID: z.string(),

    AWS_SECRET_ACCESS_KEY: z.string(),

});