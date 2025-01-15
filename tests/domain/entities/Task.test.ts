import { describe, it, expect } from 'vitest';
import { Task, TaskStatus } from '../../../src/domain/entities/Task';

describe('Task Entity', () => {
  it('should create a valid task', () => {
    const task: Task = {
      id: '123',
      title: 'Test Task',
      description: 'Test Description',
      status: TaskStatus.TODO,
      createdAt: '2024-03-15T10:00:00Z',
      updatedAt: '2024-03-15T10:00:00Z',
    };

    expect(task.id).toBe('123');
    expect(task.title).toBe('Test Task');
    expect(task.description).toBe('Test Description');
    expect(task.status).toBe(TaskStatus.TODO);
    expect(task.createdAt).toBe('2024-03-15T10:00:00Z');
    expect(task.updatedAt).toBe('2024-03-15T10:00:00Z');
  });

  it('should have all valid task statuses', () => {
    expect(Object.values(TaskStatus)).toEqual(['TODO', 'IN_PROGRESS', 'DONE']);
  });
});
