import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CreateTask } from '../../../src/infrastructure/handlers/createTask';
import { TaskStatus } from '../../../src/domain/entities/Task';
import { APIGatewayProxyEvent } from 'aws-lambda';
import middy from '@middy/core';
import { CreateTaskUseCase } from '../../../src/application/CreateTaskUseCase';
import jsonBodyParser from '@middy/http-json-body-parser';

const mockCreateTaskUseCase = {
  execute: vi.fn(),
};

describe('createTask handler', () => {
  let handler: middy.MiddyfiedHandler;

  beforeEach(() => {
    const createTask = new CreateTask(mockCreateTaskUseCase as unknown as CreateTaskUseCase);
    handler = middy(async (event: APIGatewayProxyEvent) => createTask.handle(event)).use(
      jsonBodyParser()
    );

    vi.clearAllMocks();
  });

  const mockEvent = (body: any): APIGatewayProxyEvent => ({
    body: body,
    headers: {
      'Content-Type': 'application/json',
    },
    multiValueHeaders: {},
    httpMethod: 'POST',
    isBase64Encoded: false,
    path: '/tasks',
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {} as any,
    resource: '',
  });

  it('should create a task successfully', async () => {
    const taskData = {
      title: 'Test Task',
      description: 'Test Description',
      status: TaskStatus.TODO,
    };

    const expectedTask = {
      id: '123',
      ...taskData,
      createdAt: new Date().toISOString(),
    };

    mockCreateTaskUseCase.execute.mockImplementation(() => Promise.resolve(expectedTask));

    const response = await handler(mockEvent(JSON.stringify(taskData)), {} as any);

    expect(response.statusCode).toBe(201);
    expect(JSON.parse(response.body)).toEqual(expectedTask);
    expect(mockCreateTaskUseCase.execute).toHaveBeenCalledWith(taskData);
  });

  it('should return 400 error if title is empty', async () => {
    const invalidTaskData = {
      title: '',
      description: 'Test Description',
      status: TaskStatus.TODO,
    };

    const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {});

    const response = await handler(mockEvent(JSON.stringify(invalidTaskData)), {} as any);

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({ message: 'Invalid request' });
    expect(mockCreateTaskUseCase.execute).not.toHaveBeenCalled();

    consoleErrorMock.mockRestore();
  });

  it('should return 400 error if description is missing', async () => {
    const invalidTaskData = {
      title: 'Test Task',
      description: '',
      status: TaskStatus.TODO,
    };

    const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {});

    const response = await handler(mockEvent(JSON.stringify(invalidTaskData)), {} as any);

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({ message: 'Invalid request' });
    expect(mockCreateTaskUseCase.execute).not.toHaveBeenCalled();

    consoleErrorMock.mockRestore();
  });

  it('should return 400 error if status is invalid', async () => {
    const invalidTaskData = {
      title: 'Test Task',
      description: 'Test Description',
      status: 'INVALID_STATUS',
    };

    const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {});

    const response = await handler(mockEvent(JSON.stringify(invalidTaskData)), {} as any);

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({ message: 'Invalid request' });
    expect(mockCreateTaskUseCase.execute).not.toHaveBeenCalled();

    consoleErrorMock.mockRestore();
  });

  it('should return 400 error if use case throws error', async () => {
    const taskData = {
      title: 'Test Task',
      description: 'Test Description',
      status: TaskStatus.TODO,
    };

    const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {});

    mockCreateTaskUseCase.execute.mockImplementation(() =>
      Promise.reject(new Error('Use case error'))
    );

    const response = await handler(mockEvent(JSON.stringify(taskData)), {} as any);

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({ message: 'Invalid request' });
    expect(mockCreateTaskUseCase.execute).toHaveBeenCalledWith(taskData);

    consoleErrorMock.mockRestore();
  });
});
