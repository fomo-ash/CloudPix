import { S3ObjectCreatedEvent } from "./s3-event";

export function parseS3Event(body: string): S3ObjectCreatedEvent | null {
  const payload = JSON.parse(body);

  if (payload.event === "s3:TestEvent" || payload.Event === "s3:TestEvent") {
    return null;
  }

  const record = payload.Records?.[0];

  if (!record) {
    throw new Error("Invalid S3 event");
  }

  return {
    bucket: record.s3.bucket.name,
    objectKey: decodeURIComponent(
      record.s3.object.key.replace(/\+/g, " ")
    ),
    eventTime: new Date(record.eventTime),
  };
}
