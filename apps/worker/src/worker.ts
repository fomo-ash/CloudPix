import { deleteMessage, receiveMessages } from "@cloudpix/aws";
import { parseS3Event } from "@cloudpix/shared";
import { handleS3ObjectCreated } from "./handlers/s3-object-created.handler";

export async function startWorker() {
  console.log("Worker started");

  while (true) {
    const messages = await receiveMessages();

    for (const message of messages) {
      if (!message.Body || !message.ReceiptHandle) {
        continue;
      }

      try {
        const event = parseS3Event(message.Body);

        if (!event) {
          await deleteMessage(message.ReceiptHandle);
          continue;
        }

        await handleS3ObjectCreated(event);

        await deleteMessage(message.ReceiptHandle);
      } catch (error) {
        console.error("Worker failed:", error);
      }
    }
  }
}