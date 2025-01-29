import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import { z } from 'zod';
import { TaskStatus } from '../../domain/entities/Task';
import { CreateTaskUseCase } from '../../application/CreateTaskUseCase';
import { DynamoDBTaskRepository } from '../repositories/DynamoDBTaskRepository';
import { DynamoDBAdapter } from '../adapters/DynamoDBAdapter';

const taskSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().min(1),
    status: z.nativeEnum(TaskStatus),
  })
  .strict();

type TaskInput = z.infer<typeof taskSchema>;

export class CreateTask {
  constructor(private createTaskUseCase: CreateTaskUseCase) {}

  async handle(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
      const parsedBody = taskSchema.parse(event.body) as TaskInput;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const task = await this.createTaskUseCase.execute(parsedBody);

      return {
        statusCode: 201,
        body: JSON.stringify(task),
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: 'Validation error',
            errors: error.errors,
          }),
        };
      }

      console.error('Error creating task:', error);
      return {
        statusCode: error instanceof Error ? 500 : 400,
        body: JSON.stringify({ message: 'Internal server error' }),
      };
    }
  }
}

export const handler = middy()
  .use(jsonBodyParser())
  .handler(async (event: APIGatewayProxyEvent) => {
    if (!process.env.DYNAMODB_TABLE) {
      throw new Error('DYNAMODB_TABLE environment variable is not set');
    }

    const repository = new DynamoDBTaskRepository(
      DynamoDBAdapter.getInstance(),
      process.env.DYNAMODB_TABLE
    );

    return new CreateTask(new CreateTaskUseCase(repository)).handle(event);
  });
