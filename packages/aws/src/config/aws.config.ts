import { env } from "@cloudpix/env";

export const awsConfig = {
    region: env.AWS_REGION,
    bucketName: env.AWS_S3_BUCKET_NAME,
    queueUrl: env.AWS_SQS_QUEUE_URL,
    queueArn: env.AWS_SQS_QUEUE_ARN,
    originalPrefix: env.S3_ORIGINAL_PREFIX,

   processedPrefix: env.S3_PROCESSED_PREFIX,

   thumbnailPrefix: env.S3_THUMBNAIL_PREFIX,
} as const;