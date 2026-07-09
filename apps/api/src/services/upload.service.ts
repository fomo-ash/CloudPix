import { v4 as uuid } from "uuid";

import {
  generateUploadUrl,
  awsConfig,
} from "@cloudpix/aws";

import {
  AssetRepository,
} from "@cloudpix/database";

import type {
  PresignedUploadRequest,
  PreSignedUploadResponse,
} from "@cloudpix/shared";

export class UploadService {
  private assetRepository = new AssetRepository();

  async createPresignedUpload(
    request: PresignedUploadRequest
  ): Promise<PreSignedUploadResponse> {

    const uploadId = uuid();

    const s3Key =
      `${awsConfig.originalPrefix}${uploadId}/${request.fileName}`;

    const asset = await this.assetRepository.create({
      uploadId,
      originalFileName: request.fileName,
      mimeType: request.fileType,
      bucket: awsConfig.bucketName,
      objectKey: s3Key,
    });

    const uploadUrl = await generateUploadUrl(
      s3Key,
      request.fileType,
    );

    return {
      assetId: asset.id,
      uploadUrl,
      s3Key,
    };
  }
}

export const uploadService = new UploadService();