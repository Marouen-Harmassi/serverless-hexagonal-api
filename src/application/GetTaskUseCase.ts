import { TaskRepository } from '../domain/repositories/TaskRepository';
import { Task } from '../domain/entities/Task';

export class GetTaskUseCase {
  constructor(private taskRepository: TaskRepository) {}

  async execute(id: string): Promise<Task | null> {
    return this.taskRepository.findById(id);
  }
}
