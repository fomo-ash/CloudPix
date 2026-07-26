import { deleteMessage, receiveMessages } from "@cloudpix/aws";
import { parseS3Event } from "@cloudpix/shared";
import { handleS3ObjectCreated } from "./handlers/s3-object-created.handler";

export async function startWorker() {
  console.log("Worker started");

  while (true) {
    try {
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
          console.error("Worker failed processing message:", error);
        }
      }
    } catch (error) {
      console.error("Worker failed to connect to AWS (Invalid keys or Queue URL):", error);
      // Sleep for 5 seconds before retrying so it doesn't crash the server instantly
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}