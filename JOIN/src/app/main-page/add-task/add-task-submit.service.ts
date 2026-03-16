import { Injectable, inject } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { Contact } from '../../shared/interfaces/contact';
import { Subtask, Task, TaskAttachment } from '../../shared/interfaces/task';
import { TaskAttachmentProcessingService } from '../../shared/services/task-attachment-processing.service';
import { TaskService } from '../../shared/services/task.service';
import {
  MAX_TASK_ATTACHMENT_BYTES,
  TASK_ATTACHMENT_LIMIT_MESSAGE,
} from '../../shared/utilities/task-attachment.constants';
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
  persistedTask: Task | null;
  errorMessage: string;
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
    const exceedsAttachmentLimit = this.hasExceededAttachmentLimit(attachments);

    if (exceedsAttachmentLimit) {
      return {
        persistedTask: null,
        errorMessage: this.buildAttachmentLimitMessage(),
        warningMessage,
        shouldResetForm: false,
        selectedAttachments: input.selectedAttachments,
      };
    }

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
        errorMessage: '',
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
      errorMessage: '',
      warningMessage,
      shouldResetForm: true,
      selectedAttachments: input.selectedAttachments,
    };
  }

  /**
   * Checks whether the persisted attachment payload would exceed the database limit.
   *
   * @param attachments Attachments prepared for persistence.
   * @returns `true` when the combined base64 payload is larger than 1 MB.
   */
  private hasExceededAttachmentLimit(attachments: TaskAttachment[]): boolean {
    const totalAttachmentBytes = attachments.reduce((total, attachment) => {
      return total + attachment.base64Size;
    }, 0);

    return totalAttachmentBytes > MAX_TASK_ATTACHMENT_BYTES;
  }

  /**
   * Builds the user-facing upload limit error message.
   *
   * @returns Localized error message for oversized task image uploads.
   */
  private buildAttachmentLimitMessage(): string {
    return TASK_ATTACHMENT_LIMIT_MESSAGE;
  }
}
