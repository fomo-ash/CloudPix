import type { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import { generateUploadUrl, awsConfig } from "@cloudpix/aws";
import {PresignedUploadRequest, PreSignedUploadResponse} from "@cloudpix/shared";

export async function getPresignedUrl(
  req: Request,
  res: Response
) {
  try {
    const { fileName, fileType } = req.body as PresignedUploadRequest;

    if (!fileName || !fileType) {
      return res.status(400).json({
        message: "fileName and fileType are required",
      });
    }

    const uploadId = uuid();

    const s3Key =
      `${awsConfig.originalPrefix}${uploadId}/${fileName}`;

    const uploadUrl = await generateUploadUrl(
      s3Key,
      fileType
    );

    const response: PreSignedUploadResponse = {
      uploadUrl,
      s3Key,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}