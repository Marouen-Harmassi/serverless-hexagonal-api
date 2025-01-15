import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DynamoDBTaskRepository } from '../../../src/infrastructure/repositories/DynamoDBTaskRepository';
import { DynamoDBAdapter } from '../../../src/infrastructure/adapters/DynamoDBAdapter';
import { Task, TaskStatus } from '../../../src/domain/entities/Task';

vi.mock('../../../src/infrastructure/adapters/DynamoDBAdapter', () => ({
  DynamoDBAdapter: {
    getInstance: vi.fn(),
  },
}));

describe('DynamoDBTaskRepository', () => {
  let repository: DynamoDBTaskRepository;
  let mockDocClient: any;

  const mockTask: Task = {
    id: '123',
    title: 'Test Task',
    description: 'Test Description',
    status: TaskStatus.TODO,
    createdAt: '2024-03-15T10:00:00Z',
    updatedAt: '2024-03-15T10:00:00Z',
  };

  beforeEach(() => {
    mockDocClient = {
      send: vi.fn(),
    };
    (DynamoDBAdapter.getInstance as any).mockReturnValue(mockDocClient);
    repository = new DynamoDBTaskRepository(mockDocClient, 'test-table');
  });

  describe('create', () => {
    it('should create a task in DynamoDB', async () => {
      mockDocClient.send.mockResolvedValue({});

      const result = await repository.create(mockTask);

      expect(mockDocClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {
            TableName: 'test-table',
            Item: mockTask,
          },
        })
      );
      expect(result).toEqual(mockTask);
    });
  });

  describe('findById', () => {
    it('should return a task when it exists', async () => {
      mockDocClient.send.mockResolvedValue({ Item: mockTask });

      const result = await repository.findById('123');

      expect(mockDocClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {
            TableName: 'test-table',
            Key: { id: '123' },
          },
        })
      );
      expect(result).toEqual(mockTask);
    });

    it('should return null when task does not exist', async () => {
      mockDocClient.send.mockResolvedValue({});

      const result = await repository.findById('123');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a task in DynamoDB', async () => {
      mockDocClient.send.mockResolvedValue({});

      const result = await repository.update(mockTask);

      expect(mockDocClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {
            TableName: 'test-table',
            Item: mockTask,
          },
        })
      );
      expect(result).toEqual(mockTask);
    });
  });

  describe('delete', () => {
    it('should delete a task from DynamoDB', async () => {
      mockDocClient.send.mockResolvedValue({});

      await repository.delete('123');

      expect(mockDocClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {
            TableName: 'test-table',
            Key: { id: '123' },
          },
        })
      );
    });
  });
});
