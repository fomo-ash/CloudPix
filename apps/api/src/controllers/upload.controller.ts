import type { Request, Response } from "express";

import {
  uploadService,
} from "../services/upload.service";
import { logger } from "@cloudpix/shared";
import { generatePresignedGetUrl } from "@cloudpix/aws";

import type {
  PresignedUploadRequest,
} from "@cloudpix/shared";

import * as assetService from "../services/asset.service";

export async function getPresignedUrl(
  req: Request,
  res: Response,
) {
  try {

    const request =
      req.body as PresignedUploadRequest;

    if (!request.fileName || !request.fileType) {
      return res.status(400).json({
        message: "fileName and fileType are required",
      });
    }

    const response =
      await uploadService.createPresignedUpload(
        request,
      );

    return res.status(200).json(response);

  } catch (error) {

    logger.error({ err: error }, "Error getting presigned url");

    return res.status(500).json({
      message: "Internal Server Error",
    });

  }
}

export async function getUploadStatus(
  req: Request,
  res: Response,
) {
    try{
      const uploadId = req.params.uploadId as string;

      if(!uploadId){
        return res.status(400).json({
          message:"UploadId is required"
        })
      }

      const asset = await assetService.getUpload(uploadId)

      if(!asset){
        return res.status(404).json({
          message:"Upload not found"
        })
      }

      const processedUrl = asset.processedKey
        ? await generatePresignedGetUrl(asset.processedKey)
        : null;
      const thumbnailUrl = asset.thumbnailKey
        ? await generatePresignedGetUrl(asset.thumbnailKey)
        : null;
      const originalUrl = asset.objectKey
        ? await generatePresignedGetUrl(asset.objectKey)
        : null;

      return res.status(200).json({
        id: asset.id,
        uploadId: asset.uploadId,
        status: asset.status,
        ocrText: asset.ocrText,
        thumbnailKey: asset.thumbnailKey,
        processedKey: asset.processedKey,
        thumbnailUrl,
        processedUrl,
        originalUrl,
      })
    } catch (error) {
    logger.error({ err: error, uploadId: req.params.uploadId }, "Error fetching upload status");
    return res.status(500).json({
            message:"Internal server Error"
        })
    }
}