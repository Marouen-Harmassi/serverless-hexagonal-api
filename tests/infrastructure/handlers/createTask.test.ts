import { beforeEach, describe, expect, it, vi } from 'vitest';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { Task, TaskStatus } from '../../../src/domain/entities/Task';
import { CreateTask, handler } from '../../../src/infrastructure/handlers/createTask';
import { CreateTaskUseCase } from '../../../src/application/CreateTaskUseCase';

vi.mock('../../../src/application/CreateTaskUseCase');

const mockTask = (overrides?: Partial<Task>): Task => ({
  id: '123',
  title: 'Test Task',
  description: 'Test Description',
  status: TaskStatus.TODO,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

const mockEvent = (body: unknown): APIGatewayProxyEvent => ({
  body: JSON.stringify(body),
  headers: { 'Content-Type': 'application/json' },
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

describe('CreateTask Lambda Function', () => {
  const mockExecute = vi.mocked(CreateTaskUseCase.prototype.execute);

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.DYNAMODB_TABLE = 'test-table';
  });

  describe('Request Validation', () => {
    it('should return 400 when title is missing', async () => {
      const response = await handler(
        mockEvent({
          description: 'Test',
          status: TaskStatus.TODO,
        }),
        {} as any
      );

      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body).errors).toContainEqual(
        expect.objectContaining({
          path: ['title'],
          message: 'Required',
        })
      );
      expect(mockExecute).not.toHaveBeenCalled();
    });

    it('should return 400 when description is missing', async () => {
      const response = await handler(
        mockEvent({
          title: 'Test',
          status: TaskStatus.TODO,
        }),
        {} as any
      );

      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body).errors).toContainEqual(
        expect.objectContaining({
          path: ['description'],
          message: 'Required',
        })
      );
      expect(mockExecute).not.toHaveBeenCalled();
    });

    it('should return 400 when status is invalid', async () => {
      const response = await handler(
        mockEvent({
          title: 'Test',
          description: 'Test',
          status: 'INVALID_STATUS',
        }),
        {} as any
      );

      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body).errors[0].path).toEqual(['status']);
      expect(mockExecute).not.toHaveBeenCalled();
    });
  });

  describe('Business Logic', () => {
    it('should create task with valid payload', async () => {
      const task = mockTask();
      mockExecute.mockResolvedValue(task);

      const response = await handler(
        mockEvent({
          title: task.title,
          description: task.description,
          status: task.status,
        }),
        {} as any
      );

      expect(response.statusCode).toBe(201);
      expect(JSON.parse(response.body)).toEqual(task);
    });
  });

  describe('Error Handling', () => {
    it('should return 500 on infrastructure errors', async () => {
      mockExecute.mockRejectedValue(new Error('DB error'));

      const response = await handler(
        mockEvent({
          title: 'Test',
          description: 'Test',
          status: TaskStatus.TODO,
        }),
        {} as any
      );

      expect(response.statusCode).toBe(500);
    });

    it('should throw when DynamoDB table is missing', async () => {
      delete process.env.DYNAMODB_TABLE;

      await expect(handler(mockEvent({}), {} as any)).rejects.toThrow(
        'DYNAMODB_TABLE environment variable is not set'
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle maximum length inputs', async () => {
      const longString = 'a'.repeat(1000);
      const task = mockTask({
        title: longString,
        description: longString,
      });

      mockExecute.mockResolvedValue(task);

      const response = await handler(
        mockEvent({
          title: longString,
          description: longString,
          status: TaskStatus.TODO,
        }),
        {} as any
      );

      expect(response.statusCode).toBe(201);
      expect(JSON.parse(response.body).title).toHaveLength(1000);
    });
  });
});

describe('CreateTask Class', () => {
  const mockCreateTaskUseCase = {
    execute: vi.fn(),
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should handle unexpected error structure', async () => {
    mockCreateTaskUseCase.execute.mockRejectedValue({ foo: 'bar' });

    const createTask = new CreateTask(mockCreateTaskUseCase as unknown as CreateTaskUseCase);
    const response = await createTask.handle({
      body: {
        title: 'Test',
        description: 'Test',
        status: TaskStatus.TODO,
      },
    } as unknown as APIGatewayProxyEvent);

    expect(response.statusCode).toBe(400);
  });

  it('should handle empty event body', async () => {
    const createTask = new CreateTask(mockCreateTaskUseCase as unknown as CreateTaskUseCase);
    const response = await createTask.handle({ body: null } as APIGatewayProxyEvent);

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).errors).toBeInstanceOf(Array);
  });
});
