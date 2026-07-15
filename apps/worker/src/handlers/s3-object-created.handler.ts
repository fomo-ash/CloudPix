import { downloadObject, uploadObject } from "@cloudpix/aws";
import { S3ObjectCreatedEvent, getProcessedKey, getUploadIdFromKey, getThumbnailKey, logger } from "@cloudpix/shared";
import { compressImage, readMetadata } from "../services/image.service";
import { AssetRepository, AssetStatus } from "@cloudpix/database";
import { mediaProcessingService } from "../services/media-processing.service";

const assetRepository = new AssetRepository();

export async function handleS3ObjectCreated(
  event: S3ObjectCreatedEvent
): Promise<void> {

  logger.info({ bucket: event.bucket, objectKey: event.objectKey }, "Processing S3 object created event");

  const uploadId = getUploadIdFromKey(event.objectKey);
  if (!uploadId) {
    throw new Error(`Could not extract uploadId from object key: ${event.objectKey}`);
  }

  // 1. Mark status as PROCESSING immediately
  await assetRepository.updateStatus(uploadId, AssetStatus.PROCESSING);
  logger.info({ uploadId }, "Asset status updated to PROCESSING");

  try {
    const downloadedObject = await downloadObject(
      event.bucket,
      event.objectKey
    );

    const processedMedia =
    await mediaProcessingService.process(downloadedObject);

    const processedKey = getProcessedKey(
      event.objectKey
    );

    const thumbnailKey =
    getThumbnailKey(event.objectKey);

    await uploadObject(
       event.bucket,
       processedKey,
       processedMedia.compressImage.buffer,
       processedMedia.compressImage.mimeType
    );

    await uploadObject(
       event.bucket,
       thumbnailKey,
       processedMedia.thumbnail.buffer,
       processedMedia.thumbnail.mimeType
    );

    await assetRepository.updateProcessingResult(
      uploadId,
      processedKey,
      thumbnailKey,
      processedMedia.ocrText
    );

    const asset = await assetRepository.findByUploadId(uploadId);

    console.log("Database updated with processedKey:", processedKey);
    console.log(
      `Downloaded ${downloadedObject.length} bytes`
    );
    console.log(
      `Compressed: ${processedMedia.compressImage.buffer.length} bytes`
    );
  } catch (error) {
    // 3. Mark status as FAILED if any error occurs
    await assetRepository.updateStatus(uploadId, AssetStatus.FAILED);
    throw error;
  }
}