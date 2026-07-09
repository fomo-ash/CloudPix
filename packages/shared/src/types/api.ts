export interface PreSignedUploadResponse{
    uploadUrl:string,
    s3Key:string,
    assetId:string,
}

export interface PresignedUploadRequest {
  fileName: string;
  fileType: string;
}