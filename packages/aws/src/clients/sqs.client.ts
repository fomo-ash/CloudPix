import { SQSClient } from "@aws-sdk/client-sqs";
import { awsConfig } from "../config/aws.config";

export const sqsClient = new SQSClient({
  region: awsConfig.region,
});