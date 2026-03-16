import { Injectable, inject } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { Contact } from '../../shared/interfaces/contact';
import { Subtask, Task, TaskAttachment } from '../../shared/interfaces/task';
import { TaskAttachmentProcessingService } from '../../shared/services/task-attachment-processing.service';
import { TaskService } from '../../shared/services/task.service';
import { buildAddTaskPayload } from './add-task-mapper.utils';

/**
 * Normalized add-task form data required for persistence.
 */
export type AddTaskSubmissionInput = {
  taskToEdit: Task | null;
  initialStatus: Task['status'];
  title: Task['title'];
  description: Task['description'];
  dueDate: Date;
  priority: Task['priority'];
  activeAssignees: Contact[];
  category: Task['category'];
  activeSubtasks: Subtask[];
  editableExistingAttachments: TaskAttachment[];
  selectedAttachments: File[];
};

/**
 * Result returned after creating or updating a task.
 */
export type AddTaskSubmissionResult = {
  persistedTask: Task;
  warningMessage: string;
  shouldResetForm: boolean;
  selectedAttachments: File[];
};

/**
 * Persists add-task form data for both create and edit workflows.
 */
@Injectable({
  providedIn: 'root',
})
export class AddTaskSubmitService {
  private readonly taskService = inject(TaskService);
  private readonly taskAttachmentProcessingService = inject(TaskAttachmentProcessingService);

  /**
   * Creates or updates a task from normalized form data.
   *
   * @param input Add-task submission input.
   * @returns Persistence result for the hosting component.
   */
  async submitTask(input: AddTaskSubmissionInput): Promise<AddTaskSubmissionResult> {
    const dueDate = Timestamp.fromDate(input.dueDate);
    const { attachments, warningMessage } =
      await this.taskAttachmentProcessingService.resolveAttachmentsForSave(
        input.editableExistingAttachments,
        input.selectedAttachments
      );

    const assigneeIds = input.activeAssignees
      .map((contact) => contact.id)
      .filter((id): id is string => Boolean(id));

    const taskPayload = buildAddTaskPayload(
      input.title,
      input.description,
      dueDate,
      input.priority,
      assigneeIds,
      input.category,
      input.activeSubtasks,
      attachments
    );

    if (input.taskToEdit?.id) {
      const updatedTask: Task = {
        ...input.taskToEdit,
        ...taskPayload,
      };

      await this.taskService.updateDocument(updatedTask, 'tasks');

      return {
        persistedTask: updatedTask,
        warningMessage,
        shouldResetForm: false,
        selectedAttachments: [],
      };
    }

    const tasksInTargetColumn = this.taskService.tasks.filter(
      (task) => task.status === input.initialStatus
    );
    const newOrder = tasksInTargetColumn.length;

    const task: Task = {
      status: input.initialStatus,
      order: newOrder,
      ...taskPayload,
    };

    const createdTaskId = await this.taskService.addDocument(task);
    const persistedTask = createdTaskId ? { ...task, id: createdTaskId } : task;

    return {
      persistedTask,
      warningMessage,
      shouldResetForm: true,
      selectedAttachments: input.selectedAttachments,
    };
  }
}
