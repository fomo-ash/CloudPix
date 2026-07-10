import { GetObjectCommand } from "@aws-sdk/client-s3";
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