import type { Request, Response } from "express";

import {
  uploadService,
} from "../services/upload.service";

import type {
  PresignedUploadRequest,
} from "@cloudpix/shared";

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