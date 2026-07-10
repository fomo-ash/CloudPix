export interface S3ObjectCreatedEvent {
  bucket: string;
  objectKey: string;
  eventTime: Date;
}

export interface DownloadedObject {
    buffer: Buffer;
    contentType?: string;
    contentLength?: number;
}
