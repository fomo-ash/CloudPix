import { prisma } from "../prisma.js";
import { AssetStatus } from "../../generated/client/index.js";

export class AssetRepository {
  async create(data: {
    uploadId: string;
    originalFileName: string;
    mimeType: string;
    bucket: string;
    objectKey: string;
  }) {
    return prisma.asset.create({
      data: {
        uploadId: data.uploadId,
        originalFileName: data.originalFileName,
        mimeType: data.mimeType,
        bucket: data.bucket,
        objectKey: data.objectKey,
        size: 0,
        status: AssetStatus.UPLOADED,
      },
    });
  }

  async findByUploadId(uploadId: string) {
    return prisma.asset.findUnique({
      where: {
        uploadId,
      },
    });
  }

  async updateStatus(uploadId: string, status: AssetStatus) {
    return prisma.asset.update({
      where: {
        uploadId,
      },
      data: {
        status,
      },
    });
  }

  async updateProcessingResult(uploadId: string, processedKey: string, thumbnailKey: string, ocrText: string) {
    return prisma.asset.update({
      where: {
        uploadId,
      },
      data: {
        processedKey,
        thumbnailKey,
        status: AssetStatus.COMPLETED,
        ocrText
      },
    });
  }

  async findById(id: string) {
  return prisma.asset.findUnique({
    where: {
      id,
    },
  });
  }

  async findRecentUploads() {
    return prisma.asset.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });
  }
}