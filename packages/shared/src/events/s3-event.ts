export interface S3ObjectCreatedEvent {
  bucket: string;
  objectKey: string;
  eventTime: Date;
}
