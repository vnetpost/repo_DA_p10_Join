import { Injectable, inject } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { Contact } from '../../../shared/interfaces/contact';
import { Subtask, Task, TaskAttachment } from '../../../shared/interfaces/task';
import { TaskAttachmentProcessingService } from '../../../shared/services/task-attachment-processing.service';
import { TaskService } from '../../../shared/services/task.service';
import {
  MAX_TASK_ATTACHMENT_BYTES,
  TASK_ATTACHMENT_LIMIT_MESSAGE,
} from '../../../shared/utilities/task-attachment.constants';
import { buildAddTaskPayload } from '../utils/add-task-mapper.utils';

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
    const resolvedSubmission = await this.resolveSubmission(input);
    if ('limitExceeded' in resolvedSubmission) {
      return this.buildLimitExceededResult(input.selectedAttachments, resolvedSubmission.warningMessage);
    }

    if (input.taskToEdit?.id) {
      return this.updateExistingTask(input, resolvedSubmission.payload, resolvedSubmission.warningMessage);
    }

    return this.createNewTask(input, resolvedSubmission.payload, resolvedSubmission.warningMessage);
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

  /**
   * Resolves the payload and warnings required for one submission.
   *
   * @param input Add-task submission input.
   * @returns Resolved payload or limit-exceeded state.
   */
  private async resolveSubmission(input: AddTaskSubmissionInput) {
    const resolvedAttachments = await this.resolveAttachments(input);
    if (this.hasExceededAttachmentLimit(resolvedAttachments.attachments)) {
      return { limitExceeded: true, warningMessage: resolvedAttachments.warningMessage };
    }

    return {
      payload: this.buildTaskPayload(input, resolvedAttachments.attachments),
      warningMessage: resolvedAttachments.warningMessage,
    };
  }

  /**
   * Resolves the final attachments for one add-task submission.
   *
   * @param input Add-task submission input.
   * @returns Persisted attachments plus a warning message.
   */
  private resolveAttachments(input: AddTaskSubmissionInput) {
    return this.taskAttachmentProcessingService.resolveAttachmentsForSave(
      input.editableExistingAttachments,
      input.selectedAttachments
    );
  }

  /**
   * Builds the normalized task payload shared by create and update flows.
   *
   * @param input Add-task submission input.
   * @param attachments Persisted attachment payloads.
   * @returns Shared task payload.
   */
  private buildTaskPayload(input: AddTaskSubmissionInput, attachments: TaskAttachment[]) {
    const assigneeIds = this.mapAssigneeIds(input.activeAssignees);
    const dueDate = Timestamp.fromDate(input.dueDate);
    return buildAddTaskPayload(
      input.title,
      input.description,
      dueDate,
      input.priority,
      assigneeIds,
      input.category,
      input.activeSubtasks,
      attachments
    );
  }

  /**
   * Maps selected contacts to persisted assignee ids.
   *
   * @param activeAssignees Selected contacts from the form.
   * @returns Persisted contact ids.
   */
  private mapAssigneeIds(activeAssignees: Contact[]): string[] {
    return activeAssignees.map((contact) => contact.id).filter((id): id is string => Boolean(id));
  }

  /**
   * Builds the submission result for an exceeded upload limit.
   *
   * @param selectedAttachments Currently selected files.
   * @param warningMessage Warning message returned by attachment processing.
   * @returns Failed submission result.
   */
  private buildLimitExceededResult(
    selectedAttachments: File[],
    warningMessage: string
  ): AddTaskSubmissionResult {
    return {
      persistedTask: null,
      errorMessage: this.buildAttachmentLimitMessage(),
      warningMessage,
      shouldResetForm: false,
      selectedAttachments,
    };
  }

  /**
   * Persists an update for an existing task.
   *
   * @param input Add-task submission input.
   * @param payload Shared task payload.
   * @param warningMessage Warning message returned by attachment processing.
   * @returns Successful update result.
   */
  private async updateExistingTask(
    input: AddTaskSubmissionInput,
    payload: Omit<Task, 'status' | 'order'>,
    warningMessage: string
  ): Promise<AddTaskSubmissionResult> {
    const updatedTask: Task = { ...input.taskToEdit!, ...payload };
    await this.taskService.updateDocument(updatedTask, 'tasks');
    return this.buildSuccessResult(updatedTask, warningMessage, false, []);
  }

  /**
   * Persists a newly created task.
   *
   * @param input Add-task submission input.
   * @param payload Shared task payload.
   * @param warningMessage Warning message returned by attachment processing.
   * @returns Successful create result.
   */
  private async createNewTask(
    input: AddTaskSubmissionInput,
    payload: Omit<Task, 'status' | 'order'>,
    warningMessage: string
  ): Promise<AddTaskSubmissionResult> {
    const task = this.buildNewTask(input.initialStatus, payload);
    const createdTaskId = await this.taskService.addDocument(task);
    const persistedTask = createdTaskId ? { ...task, id: createdTaskId } : task;
    return this.buildSuccessResult(persistedTask, warningMessage, true, input.selectedAttachments);
  }

  /**
   * Builds a new task with the next order value in the target column.
   *
   * @param status Target task status.
   * @param payload Shared task payload.
   * @returns New task entity ready for persistence.
   */
  private buildNewTask(status: Task['status'], payload: Omit<Task, 'status' | 'order'>): Task {
    const tasksInTargetColumn = this.taskService.tasks.filter((task) => task.status === status);
    return { status, order: tasksInTargetColumn.length, ...payload };
  }

  /**
   * Builds a successful add-task submission result.
   *
   * @param persistedTask Persisted task entity.
   * @param warningMessage Warning message returned by attachment processing.
   * @param shouldResetForm Whether the form should be reset afterwards.
   * @param selectedAttachments Remaining selected files.
   * @returns Successful submission result.
   */
  private buildSuccessResult(
    persistedTask: Task,
    warningMessage: string,
    shouldResetForm: boolean,
    selectedAttachments: File[]
  ): AddTaskSubmissionResult {
    return {
      persistedTask,
      errorMessage: '',
      warningMessage,
      shouldResetForm,
      selectedAttachments,
    };
  }
}
