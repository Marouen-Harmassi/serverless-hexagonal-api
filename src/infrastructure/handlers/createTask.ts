import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import { z } from 'zod';
import { TaskStatus } from '../../domain/entities/Task';
import { CreateTaskUseCase } from '../../application/CreateTaskUseCase';
import { DynamoDBTaskRepository } from '../repositories/DynamoDBTaskRepository';
import { DynamoDBAdapter } from '../adapters/DynamoDBAdapter';

const taskSchema = z.object({
  title: z.string().min(1).nonempty(),
  description: z.string().nonempty(),
  status: z.nativeEnum(TaskStatus),
});

export class CreateTask {
  constructor(private createTaskUseCase: CreateTaskUseCase) {}

  async handle(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
      const parsedBody = taskSchema.parse(event.body);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const task = await this.createTaskUseCase.execute(parsedBody);

      return {
        statusCode: 201,
        body: JSON.stringify(task),
      };
    } catch (error) {
      console.error('Error creating task:', error);
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Invalid request' }),
      };
    }
  }
}

export const handler = middy(async (event: APIGatewayProxyEvent) => {
  return new CreateTask(
    new CreateTaskUseCase(
      new DynamoDBTaskRepository(DynamoDBAdapter.getInstance(), process.env.DYNAMODB_TABLE!)
    )
  ).handle(event);
}).use(jsonBodyParser());
