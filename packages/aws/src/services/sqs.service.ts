import { ReceiveMessageCommand, DeleteMessageCommand, Message } from "@aws-sdk/client-sqs";
import { awsConfig } from "../config/aws.config.js";
import { sqsClient } from "../clients/sqs.client";

export async function receiveMessages(): Promise<Message[]> {
    const response = await sqsClient.send(
    new ReceiveMessageCommand({
      QueueUrl: awsConfig.queueUrl,
      MaxNumberOfMessages: 5,
      WaitTimeSeconds: 20,
      VisibilityTimeout: 30,
    })
);
    return response.Messages ?? [];
}

export async function deleteMessage( receiptHandle: string): Promise<void> {
    await sqsClient.send(
    new DeleteMessageCommand({
      QueueUrl: awsConfig.queueUrl,
      ReceiptHandle: receiptHandle,
    })
  );

}