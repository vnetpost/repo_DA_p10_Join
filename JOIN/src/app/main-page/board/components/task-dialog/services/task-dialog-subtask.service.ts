import { Injectable, inject } from '@angular/core';
import { Task } from '../../../../../shared/interfaces/task';
import { TaskService } from '../../../../../shared/services/task.service';

/**
 * Handles subtask state changes inside the task dialog.
 */
@Injectable({
  providedIn: 'root',
})
export class TaskDialogSubtaskService {
  private readonly taskService = inject(TaskService);

  /**
   * Toggles the completion state of a subtask and persists the change.
   *
   * @param task Active task shown in the dialog.
   * @param index Index of the subtask to toggle.
   * @returns void
   */
  toggleSubtask(task: Task, index: number): void {
    task.subtasks[index].done = !task.subtasks[index].done;
    this.taskService.updateSubtasks(task);
  }
}
