import { TaskRepository } from '../domain/repositories/TaskRepository';
import { Task, TaskStatus } from '../domain/entities/Task';
import { v4 as uuidv4 } from 'uuid';

interface CreateTaskCommand {
  title: string;
  description: string;
  status: TaskStatus;
}

export class CreateTaskUseCase {
  constructor(private taskRepository: TaskRepository) {}

  async execute(task: CreateTaskCommand): Promise<Task> {
    const now = new Date().toISOString();
    const newTask: Task = {
      ...task,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };

    return this.taskRepository.create(newTask);
  }
}
