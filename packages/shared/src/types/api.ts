export interface PreSignedUploadResponse{
    uploadUrl:string,
    s3Key:string,
    assetId:string,
}

export interface PresignedUploadRequest {
  fileName: string;
  fileType: string;
}

export interface UploadStatusResponse {
  id: string;
  uploadId: string;
  status: "UPLOADED" | "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";
  ocrText: string | null;
  thumbnailKey: string | null;
  processedKey: string | null;
  thumbnailUrl?: string | null;
  processedUrl?: string | null;
  originalUrl?: string | null;
}