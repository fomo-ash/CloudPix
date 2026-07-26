import {
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { s3Client } from "../clients/s3.client";
import { awsConfig } from "../config/aws.config";

export async function generateUploadUrl(
  key: string,
  contentType: string,
) {
  const command = new PutObjectCommand({
    Bucket: awsConfig.bucketName,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(s3Client, command, {
    expiresIn: 300,
  });
}

export async function generatePresignedGetUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: awsConfig.bucketName,
    Key: key,
  });

  return getSignedUrl(s3Client, command, {
    expiresIn,
  });
}