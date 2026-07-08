export interface PreSignedUploadResponse{
    uploadUrl:string,
    s3Key:string,
}

export interface PresignedUploadRequest {
  fileName: string;
  fileType: string;
}