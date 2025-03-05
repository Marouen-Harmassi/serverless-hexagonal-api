import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GetTaskUseCase } from '../../application/GetTaskUseCase';
import { DynamoDBTaskRepository } from '../repositories/DynamoDBTaskRepository';
import { DynamoDBAdapter } from '../adapters/DynamoDBAdapter';

export class GetTask {
  constructor(private getTaskUseCase: GetTaskUseCase) {}

  async handle(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
      const taskId = event.pathParameters?.id;
      if (!taskId) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: 'Task ID is required' }),
        };
      }

      const task = await this.getTaskUseCase.execute(taskId);

      if (!task) {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: 'Task not found' }),
        };
      }

      return {
        statusCode: 200,
        body: JSON.stringify(task),
      };
    } catch (error) {
      console.error('Error getting task:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Internal server error' }),
      };
    }
  }
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  if (!process.env.DYNAMODB_TABLE) {
    throw new Error('DYNAMODB_TABLE environment variable is not set');
  }

  return new GetTask(
    new GetTaskUseCase(
      new DynamoDBTaskRepository(DynamoDBAdapter.getInstance(), process.env.DYNAMODB_TABLE)
    )
  ).handle(event);
};
