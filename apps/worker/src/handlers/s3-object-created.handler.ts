import { downloadObject } from "@cloudpix/aws";
import { S3ObjectCreatedEvent } from "@cloudpix/shared";
import { compressImage, readMetadata } from "../services/image.service";
import { getProcessedKey } from "@cloudpix/shared";
import { uploadObject } from "@cloudpix/aws";
export async function handleS3ObjectCreated(
  event: S3ObjectCreatedEvent
): Promise<void> {

  console.log("Bucket:", event.bucket);
  console.log("Object:", event.objectKey);

  const downloadedObject = await downloadObject(
    event.bucket,
    event.objectKey
  );

  const compressedBuffer = await compressImage(
  downloadedObject
  );
  const metadata = await readMetadata(downloadedObject);

  const processedKey = getProcessedKey(
    event.objectKey
  );

  await uploadObject(
    event.bucket,
    processedKey,
    compressedBuffer,
    "image/jpeg"
  );


  console.log(metadata);

  console.log(
    `Downloaded ${downloadedObject.length} bytes`
  );

  console.log(
  `Compressed: ${compressedBuffer.length} bytes`
);
}