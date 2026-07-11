import { S3Client } from "@aws-sdk/client-s3";
import { awsConfig } from "../config/aws.config";

export const s3Client = new S3Client({
  region: awsConfig.region,
  requestChecksumCalculation: "WHEN_REQUIRED",
});