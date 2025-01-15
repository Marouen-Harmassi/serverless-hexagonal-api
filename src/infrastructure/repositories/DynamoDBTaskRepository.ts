import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';
import { Task } from '../../domain/entities/Task';
import { TaskRepository } from '../../domain/repositories/TaskRepository';

export class DynamoDBTaskRepository implements TaskRepository {
  constructor(
    private readonly docClient: DynamoDBDocumentClient,
    private readonly tableName: string
  ) {}

  async create(task: Task): Promise<Task> {
    await this.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: task,
      })
    );
    return task;
  }

  async findById(id: string): Promise<Task | null> {
    const result = await this.docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { id },
      })
    );
    return (result.Item as Task) || null;
  }

  async update(task: Task): Promise<Task> {
    await this.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: task,
      })
    );
    return task;
  }

  async delete(id: string): Promise<void> {
    await this.docClient.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: { id },
      })
    );
  }
}
