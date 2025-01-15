import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handler } from '../../../src/infrastructure/handlers/getTask';
import { TaskStatus } from '../../../src/domain/entities/Task';
import { DynamoDBTaskRepository } from '../../../src/infrastructure/repositories/DynamoDBTaskRepository';

vi.mock('../../../src/infrastructure/repositories/DynamoDBTaskRepository');

describe('getTask handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return a task when it exists', async () => {
    const mockTask = {
      id: '123',
      title: 'Test Task',
      description: 'Test Description',
      status: TaskStatus.TODO,
      createdAt: '2024-03-15T10:00:00Z',
      updatedAt: '2024-03-15T10:00:00Z',
    };

    const mockEvent = {
      pathParameters: {
        id: '123',
      },
    } as any;

    (DynamoDBTaskRepository as any).prototype.findById = vi.fn().mockResolvedValue(mockTask);

    const result = await handler(mockEvent);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual(mockTask);
  });

  it('should return 404 when task does not exist', async () => {
    const mockEvent = {
      pathParameters: {
        id: 'non-existent-id',
      },
    } as any;

    (DynamoDBTaskRepository as any).prototype.findById = vi.fn().mockResolvedValue(null);

    const result = await handler(mockEvent);

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body)).toHaveProperty('message', 'Task not found');
  });

  it('should return 400 when task id is missing', async () => {
    const mockEvent = {
      pathParameters: null,
    } as any;

    const result = await handler(mockEvent);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toHaveProperty('message', 'Task ID is required');
  });

  it('should return 500 on unexpected error', async () => {
    const mockEvent = {
      pathParameters: {
        id: '123',
      },
    } as any;

    (DynamoDBTaskRepository as any).prototype.findById = vi
      .fn()
      .mockRejectedValue(new Error('Unexpected error'));

    const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await handler(mockEvent);

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toHaveProperty('message', 'Internal server error');

    consoleErrorMock.mockRestore();
  });
});
