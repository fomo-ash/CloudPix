import type { Request, Response } from "express";

import {
  uploadService,
} from "../services/upload.service";

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

    console.error(error);

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

      return res.status(200).json({
        id: asset.id,
        uploadId: asset.uploadId,
        status: asset.status,
        ocrText: asset.ocrText,
        thumbnailKey: asset.thumbnailKey,
        processedKey: asset.processedKey,
      })
    } catch (error) {
        console.error("Error fetching upload status", error);
        return res.status(500).json({
            message:"Internal server Error"
        })
    }
}