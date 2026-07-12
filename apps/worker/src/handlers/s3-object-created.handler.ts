import { downloadObject, uploadObject } from "@cloudpix/aws";
import { S3ObjectCreatedEvent, getProcessedKey, getUploadIdFromKey } from "@cloudpix/shared";
import { compressImage, readMetadata } from "../services/image.service";
import { AssetRepository, AssetStatus } from "@cloudpix/database";

const assetRepository = new AssetRepository();

export async function handleS3ObjectCreated(
  event: S3ObjectCreatedEvent
): Promise<void> {

  console.log("Bucket:", event.bucket);
  console.log("Object:", event.objectKey);

  const uploadId = getUploadIdFromKey(event.objectKey);
  if (!uploadId) {
    throw new Error(`Could not extract uploadId from object key: ${event.objectKey}`);
  }

  // 1. Mark status as PROCESSING immediately
  await assetRepository.updateStatus(uploadId, AssetStatus.PROCESSING);
  console.log(`Asset status updated to PROCESSING for uploadId: ${uploadId}`);

  try {
    const downloadedObject = await downloadObject(
      event.bucket,
      event.objectKey
    );

    const compressionResult = await compressImage(
      downloadedObject
    );
    const metadata = await readMetadata(downloadedObject);

    const processedKey = getProcessedKey(
      event.objectKey
    );

    await uploadObject(
       event.bucket,
       processedKey,
       compressionResult.buffer,
       compressionResult.mimeType
    );

    // 2. Mark status as COMPLETED with processedKey
    await assetRepository.updateProcessingResult(uploadId, processedKey);

    const asset = await assetRepository.findByUploadId(uploadId);

    console.log("Found asset:", asset);
    console.log("Database updated with processedKey:", processedKey);
    console.log(metadata);
    console.log(
      `Downloaded ${downloadedObject.length} bytes`
    );
    console.log(
      `Compressed: ${compressionResult.buffer.length} bytes`
    );
  } catch (error) {
    // 3. Mark status as FAILED if any error occurs
    await assetRepository.updateStatus(uploadId, AssetStatus.FAILED);
    throw error;
  }
}