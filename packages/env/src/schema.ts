import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  PORT: z.coerce.number().default(3100),

  DATABASE_URL: z.string(),
  REDIS_URL: z.string().optional(),

  AWS_REGION: z.string(),

  AWS_ACCESS_KEY_ID: z.string(),

  AWS_SECRET_ACCESS_KEY: z.string(),

  AWS_S3_BUCKET_NAME: z.string(),

  AWS_SQS_QUEUE_URL: z.string(),

  AWS_SQS_QUEUE_ARN: z.string(),

  S3_ORIGINAL_PREFIX: z.string().default("original/"),

  S3_PROCESSED_PREFIX: z.string().default("processed/"),

  S3_THUMBNAIL_PREFIX: z.string().default("thumbnails/"),
});