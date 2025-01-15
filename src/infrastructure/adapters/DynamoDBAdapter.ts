import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

export class DynamoDBAdapter {
  private static instance: DynamoDBDocumentClient;

  static getInstance(): DynamoDBDocumentClient {
    if (!DynamoDBAdapter.instance) {
      const client = new DynamoDBClient({});
      DynamoDBAdapter.instance = DynamoDBDocumentClient.from(client);
    }
    return DynamoDBAdapter.instance;
  }
}
