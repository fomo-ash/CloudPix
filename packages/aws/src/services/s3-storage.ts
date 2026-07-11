import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../clients/s3.client";

export async function downloadObject(
  bucket: string,
  key: string
): Promise<Buffer> {
  const response = await s3Client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );

  if (!response.Body) {
    throw new Error("Object body is empty.");
  }

  return Buffer.from(await response.Body.transformToByteArray());
}

export async function uploadObject(
  bucket: string,
  key: string,
  body: Buffer | Uint8Array,
  contentType: string,
  metadata?: Record<string, string>
): Promise<void> {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      Metadata: metadata,
    })
  );
}