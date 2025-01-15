import { describe, expect, it, vi } from 'vitest';
import { CreateTaskUseCase } from '../../src/application/CreateTaskUseCase';
import { TaskRepository } from '../../src/domain/repositories/TaskRepository';
import { TaskStatus } from '../../src/domain/entities/Task';
import { v4 as uuidv4 } from 'uuid';

vi.mock('uuid');

describe('GetTaskUseCase', () => {
  const mockedUUID = '123e4567-e89b-12d3-a456-426614174000';
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  vi.mocked(uuidv4).mockReturnValue(mockedUUID);

  it('should create a new task', async () => {
    const taskRepositoryMock: TaskRepository = {
      create: vi.fn(),
      delete: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
    };

    const createTaskUseCase = new CreateTaskUseCase(taskRepositoryMock);

    const taskData = {
      title: 'Test Task',
      description: 'Test Description',
      status: TaskStatus.TODO,
    };

    const mockDate = '2024-03-15T10:00:00.000Z';
    vi.setSystemTime(new Date(mockDate));

    (taskRepositoryMock.create as any).mockResolvedValue({
      ...taskData,
      id: mockedUUID,
      createdAt: mockDate,
      updatedAt: mockDate,
    });

    const result = await createTaskUseCase.execute(taskData);

    expect(result).toEqual({
      ...taskData,
      id: mockedUUID,
      createdAt: mockDate,
      updatedAt: mockDate,
    });

    expect(taskRepositoryMock.create).toHaveBeenCalledWith({
      ...taskData,
      id: mockedUUID,
      createdAt: mockDate,
      updatedAt: mockDate,
    });
  });
});
