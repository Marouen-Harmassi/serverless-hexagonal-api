import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TaskRepository } from '../../src/domain/repositories/TaskRepository';
import { GetTaskUseCase } from '../../src/application/GetTaskUseCase';
import { TaskStatus, Task } from '../../src/domain/entities/Task';

describe('GetTaskUseCase', () => {
  let taskRepository: TaskRepository;
  let getTaskUseCase: GetTaskUseCase;

  beforeEach(() => {
    taskRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    getTaskUseCase = new GetTaskUseCase(taskRepository);
  });

  it('should return a task when it exists', async () => {
    const mockTask: Task = {
      id: '123',
      title: 'Test Task',
      description: 'Test Description',
      status: TaskStatus.TODO,
      createdAt: '2024-03-15T10:00:00Z',
      updatedAt: '2024-03-15T10:00:00Z',
    };

    (taskRepository.findById as any).mockResolvedValue(mockTask);

    const result = await getTaskUseCase.execute('123');

    expect(result).toEqual(mockTask);
    expect(taskRepository.findById).toHaveBeenCalledWith('123');
  });

  it('should return null when task does not exist', async () => {
    (taskRepository.findById as any).mockResolvedValue(null);

    const result = await getTaskUseCase.execute('non-existent-id');

    expect(result).toBeNull();
    expect(taskRepository.findById).toHaveBeenCalledWith('non-existent-id');
  });
});
