import { downloadObject } from "@cloudpix/aws";
import { S3ObjectCreatedEvent } from "@cloudpix/shared";

export async function handleS3ObjectCreated(
  event: S3ObjectCreatedEvent
): Promise<void> {

  console.log("Bucket:", event.bucket);
  console.log("Object:", event.objectKey);

  const downloadedObject = await downloadObject(
    event.bucket,
    event.objectKey
  );

  console.log(
    `Downloaded ${downloadedObject.length} bytes`
  );
}