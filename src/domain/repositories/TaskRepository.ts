import { Task } from '../entities/Task';

export interface TaskRepository {
  create(task: Task): Promise<Task>;
  findById(id: string): Promise<Task | null>;
  update(task: Task): Promise<Task>;
  delete(id: string): Promise<void>;
}
