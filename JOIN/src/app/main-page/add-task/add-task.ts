import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Contact } from '../../shared/interfaces/contact';
import { Subtask, Task, TaskAttachment } from '../../shared/interfaces/task';
import { TaskCategoryOption, TaskService } from '../../shared/services/task.service';
import { DropdownAssignee } from './dropdown-assignee/dropdown-assignee';
import { DropdownCategory } from './dropdown-category/dropdown-category';
import { PrioritySelector } from './priority-selector/priority-selector';
import { SubtaskComposer } from './subtask-composer/subtask-composer';
import { TaskFormField } from './task-form-field/task-form-field';
import { AttachmentUpload } from './attachment-upload/attachment-upload';
import { Timestamp } from '@angular/fire/firestore';
import { getTodayDateString } from '../../shared/utilities/utils';
import { ContactService } from '../../shared/services/contact.service';

/**
 * Manages task creation and editing, including form state, validation and persistence.
 */
@Component({
  selector: 'app-add-task',
  imports: [
    FormsModule,
    TaskFormField,
    PrioritySelector,
    DropdownAssignee,
    DropdownCategory,
    SubtaskComposer,
    AttachmentUpload,
  ],
  templateUrl: './add-task.html',
  styleUrl: './add-task.scss',
})
export class AddTask implements OnChanges, OnDestroy {
  // #region Dependencies
  taskService = inject(TaskService);
  private contactService = inject(ContactService);
  private router = inject(Router);
  // #endregion

  // #region Inputs & Outputs
  /** Determines whether the form is rendered inside an overlay dialog. */
  @Input() isOverlay = false;
  /** Existing task to edit. If `null`, the component creates a new task. */
  @Input() taskToEdit: Task | null = null;
  /** Target status for newly created tasks. */
  @Input() initialStatus: Task['status'] = 'to-do';
  /** Requests closing the overlay once submit feedback has finished. */
  @Output() closeDialogRequested = new EventEmitter<void>();
  @Output() dirtyChange = new EventEmitter<boolean>();
  @Output() taskSaved = new EventEmitter<Task>();
  // #endregion

  // #region Constants
  minDueDate = getTodayDateString();
  readonly taskTitleMinLength = 3;
  readonly taskTitleMaxLength = 100;
  readonly taskTitleMinLetters = 3;
  readonly attachmentMaxWidth = 800;
  readonly attachmentMaxHeight = 800;
  readonly attachmentQuality = 0.8;
  showCloseConfirm: boolean = false;
  hasUserEdited: boolean = false;
  // #endregion

  // #region Form State
  taskTitle: Task['title'] = '';
  taskDescription: Task['description'] = '';
  taskDueDate = '';
  activePriority: Task['priority'] = 'medium';
  activeAssignees: Contact[] = [];
  activeCategory: TaskCategoryOption | null = null;
  activeSubtasks: Subtask[] = [];
  editableExistingAttachments: TaskAttachment[] = [];
  selectedAttachments: File[] = [];
  isTitleTouched = false;
  isDueDateTouched = false;
  isCategoryTouched = false;
  // #endregion

  // #region UI State
  toastVisible = false;
  isSubmitting = false;
  attachmentUploadError = '';
  formResetVersion = 0;
  private toastTimer?: number;
  // #endregion

  // #region Lifecycle
  /** Applies incoming task data to the form whenever edit input changes. */
  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['taskToEdit']) return;
    if (this.taskToEdit) this.populateFormForEdit(this.taskToEdit);
    else this.resetForm();
  }

  /** Clears running timers to avoid side effects after component teardown. */
  ngOnDestroy(): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }
  // #endregion

  // #region Derived State
  /** Indicates whether the form currently edits an existing task. */
  get isEditMode(): boolean {
    return Boolean(this.taskToEdit?.id);
  }

  /** Returns the dynamic headline based on create or edit mode. */
  get formTitle(): string {
    return this.isEditMode ? 'Edit Task' : 'Add Task';
  }

  /** Returns the submit button label for the active form mode. */
  get submitButtonLabel(): string {
    return this.isEditMode ? 'Save' : 'Create Task';
  }

  /** Aggregates all title-related validation states. */
  get showTitleError(): boolean {
    return this.showTitleRequiredError || this.showTitlePatternError;
  }

  /** True after title touch when the required value is empty. */
  get showTitleRequiredError(): boolean {
    return this.isTitleTouched && !this.taskTitle.trim();
  }

  /** True when title violates length or minimum-letter constraints. */
  get showTitlePatternError(): boolean {
    if (!this.isTitleTouched) return false;
    const title = this.taskTitle.trim();
    return title.length > 0 && !this.isTitleValid(title);
  }

  /** Human-readable title validation message for the UI. */
  get titleErrorMessage(): string {
    if (this.showTitleRequiredError) return 'This field is required';
    return `Use up to ${this.taskTitleMaxLength} chars with at least ${this.taskTitleMinLetters} letters (a-z)`;
  }

  /** True after due date touch when no date has been provided. */
  get showDueDateError(): boolean {
    return this.isDueDateTouched && !this.taskDueDate.trim();
  }

  /** True after category touch when no category is selected. */
  get showCategoryError(): boolean {
    return this.isCategoryTouched && !this.activeCategory;
  }

  /** Aggregate validity of all required form sections. */
  get isFormValid(): boolean {
    return (
      this.isTitleValid(this.taskTitle) &&
      this.taskDueDate.trim().length > 0 &&
      Boolean(this.activeCategory)
    );
  }
  // #endregion

  // #region Public Actions
  /**
   * Validates and persists the current form as a new task or task update.
   * Shows a toast afterwards and either closes overlay mode or navigates to board.
   */
  async createTask(): Promise<void> {
    if (this.isSubmitting) return;

    const title = this.taskTitle.trim();
    const description = this.taskDescription.trim();
    const dueDateValue = this.taskDueDate.trim();
    const validatedCategory = this.validateForm(
      title,
      dueDateValue,
      this.activeCategory?.value ?? null,
    );

    if (!validatedCategory) return;

    const dueDateDate = this.parseDueDate(dueDateValue);
    if (!dueDateDate) return;
    this.isSubmitting = true;

    try {
      const dueDate = Timestamp.fromDate(dueDateDate);
      this.attachmentUploadError = '';

      const { attachments, warningMessage } = await this.resolveAttachmentsForSave();
      this.attachmentUploadError = warningMessage;

      const assigneeIds = this.activeAssignees
        .map((contact) => contact.id)
        .filter((id): id is string => Boolean(id));
      const taskPayload = this.buildTaskPayload(
        title,
        description,
        dueDate,
        assigneeIds,
        validatedCategory,
        attachments,
      );

      let persistedTask: Task | null = null;

      if (this.isEditMode && this.taskToEdit?.id) {
        const updatedTask: Task = {
          ...this.taskToEdit,
          ...taskPayload,
        };
        await this.taskService.updateDocument(updatedTask, 'tasks');
        persistedTask = updatedTask;
        this.selectedAttachments = [];
      } else {
        const tasksInTargetColumn = this.taskService.tasks.filter(
          (task) => task.status === this.initialStatus,
        );
        const newOrder = tasksInTargetColumn.length;

        const task: Task = {
          status: this.initialStatus,
          order: newOrder,
          ...taskPayload,
        };

        const createdTaskId = await this.taskService.addDocument(task);
        persistedTask = createdTaskId ? { ...task, id: createdTaskId } : task;
        this.resetForm();
      }

      if (persistedTask) this.taskSaved.emit(persistedTask);
      this.showToast();
      this.resetDirtyState();
    } finally {
      this.isSubmitting = false;
    }
  }

  /** Resets all form fields and touch states to their defaults. */
  resetForm(): void {
    this.taskTitle = '';
    this.taskDescription = '';
    this.taskDueDate = '';
    this.activePriority = 'medium';
    this.activeAssignees = [];
    this.activeCategory = null;
    this.activeSubtasks = [];
    this.editableExistingAttachments = [];
    this.selectedAttachments = [];
    this.attachmentUploadError = '';
    this.isTitleTouched = false;
    this.isDueDateTouched = false;
    this.isCategoryTouched = false;
    this.formResetVersion += 1;
    this.resetDirtyState();
  }
  // #endregion

  // #region Private Helpers
  /**
   * Prefills the form with existing task data for edit mode.
   * @param task Task entity that should be edited.
   */
  private populateFormForEdit(task: Task): void {
    this.taskTitle = task.title;
    this.taskDescription = task.description;
    this.taskDueDate = this.formatDateForInput(task.dueDate.toDate());
    this.activePriority = task.priority;
    this.activeAssignees = task.assignees
      .map((id) => this.contactService.findContactById(id))
      .filter((contact): contact is Contact => Boolean(contact));
    this.activeCategory =
      this.taskService.taskCategories.find((category) => category.value === task.category) ?? null;
    this.activeSubtasks = task.subtasks.map((subtask) => ({ ...subtask }));
    this.editableExistingAttachments = (task.attachments ?? []).map((attachment) => ({
      ...attachment,
    }));
    this.selectedAttachments = [];
    this.attachmentUploadError = '';
    this.isTitleTouched = false;
    this.isDueDateTouched = false;
    this.isCategoryTouched = false;
    this.resetDirtyState();
  }

  /**
   * Converts a `Date` to the form input format `YYYY/MM/DD`.
   * @param date Source date object.
   * @returns Date string formatted for form controls.
   */
  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  }

  /**
   * Validates required form fields and updates touch state when invalid.
   * @param title Trimmed task title.
   * @param dueDateValue Raw due date input value.
   * @param category Selected category value.
   * @returns The validated category or `null` if validation failed.
   */
  private validateForm(
    title: Task['title'],
    dueDateValue: string,
    category: Task['category'] | null,
  ): Task['category'] | null {
    const isTitleValid = this.isTitleValid(title);

    if (!isTitleValid || !dueDateValue || !category) {
      if (!isTitleValid) this.isTitleTouched = true;
      if (!dueDateValue) this.isDueDateTouched = true;
      if (!category) this.isCategoryTouched = true;
      return null;
    }

    return category;
  }

  /**
   * Creates the shared task payload for create and update workflows.
   * @param title Normalized task title.
   * @param description Normalized task description.
   * @param dueDate Due date timestamp.
   * @param assignees Contact IDs assigned to the task.
   * @param category Validated task category.
   * @param attachments Uploaded attachments for the task.
   * @returns Base payload used for both create and update operations.
   */
  private buildTaskPayload(
    title: Task['title'],
    description: Task['description'],
    dueDate: Timestamp,
    assignees: Array<string>,
    category: Task['category'],
    attachments: TaskAttachment[],
  ): Omit<Task, 'id' | 'status' | 'order'> {
    return {
      title,
      description,
      dueDate,
      priority: this.activePriority,
      assignees,
      category,
      subtasks: [...this.activeSubtasks],
      attachments,
    };
  }

  /**
   * Resolves attachments to persist: keeps existing ones and appends new uploads in edit mode.
   * Falls back to existing attachments if upload fails so task save is not blocked.
   * @returns Attachment list and optional warning message.
   */
  private async resolveAttachmentsForSave(): Promise<{
    attachments: TaskAttachment[];
    warningMessage: string;
  }> {
    const existingAttachments = [...this.editableExistingAttachments];
    if (!this.selectedAttachments.length) {
      return {
        attachments: [...existingAttachments],
        warningMessage: '',
      };
    }

    const newAttachments: TaskAttachment[] = [];
    let failedAttachments = 0;

    for (const selectedFile of this.selectedAttachments) {
      const createdAttachment = await this.createAttachmentFromFile(selectedFile);
      if (createdAttachment) newAttachments.push(createdAttachment);
      else failedAttachments += 1;
    }

    if (failedAttachments > 0) {
      const pluralSuffix = failedAttachments > 1 ? 's were' : ' was';
      return {
        attachments: [...existingAttachments, ...newAttachments],
        warningMessage: `${failedAttachments} attachment${pluralSuffix} skipped because processing failed.`,
      };
    }

    return {
      attachments: [...existingAttachments, ...newAttachments],
      warningMessage: '',
    };
  }

  /**
   * Converts a selected file to base64 and returns attachment metadata for Firestore.
   * @param file Attachment file selected by the user.
   * @returns Attachment metadata or `null` when conversion fails.
   */
  private async createAttachmentFromFile(file: File): Promise<TaskAttachment | null> {
    try {
      const compressedDataUrl = await this.compressImage(
        file,
        this.attachmentMaxWidth,
        this.attachmentMaxHeight,
        this.attachmentQuality,
      );
      const fallbackDataUrl = compressedDataUrl ? null : await this.readFileAsDataUrl(file);
      const base64DataUrl = compressedDataUrl ?? fallbackDataUrl;
      if (!base64DataUrl) return null;

      const fileType = this.extractMimeTypeFromDataUrl(base64DataUrl) || file.type || 'image/jpeg';
      const base64 = this.extractBase64Value(base64DataUrl);
      const fileName = this.buildFileNameForMimeType(file.name, fileType);

      return {
        fileName,
        fileType,
        base64Size: base64.length,
        base64,
        uploadedAt: Timestamp.now(),
      };
    } catch (error) {
      console.error('Attachment processing failed:', error);
      return null;
    }
  }

  /**
   * Reads a file as a data URL.
   * @param file Source file from file input.
   * @returns Data URL or `null` when reading fails.
   */
  private readFileAsDataUrl(file: File): Promise<string | null> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        resolve(typeof result === 'string' ? result : null);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Compresses an image file while keeping aspect ratio.
   * Returns a JPEG data URL.
   */
  private compressImage(
    file: File,
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.8,
  ): Promise<string | null> {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result !== 'string') {
          resolve(null);
          return;
        }

        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(null);
            return;
          }

          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            } else {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          canvas.width = Math.round(width);
          canvas.height = Math.round(height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          resolve(canvas.toDataURL('image/jpeg', quality));
        };

        img.onerror = () => resolve(null);
        img.src = result;
      };

      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Extracts the pure base64 value from a data URL.
   * @param dataUrl Data URL returned by `FileReader`.
   * @returns Base64 payload without mime prefix.
   */
  private extractBase64Value(dataUrl: string): string {
    const separatorIndex = dataUrl.indexOf(',');
    if (separatorIndex === -1) return dataUrl;
    return dataUrl.slice(separatorIndex + 1);
  }

  /**
   * Extracts the mime type from a data URL.
   */
  private extractMimeTypeFromDataUrl(dataUrl: string): string {
    const mimeMatch = dataUrl.match(/^data:([^;]+);base64,/i);
    return mimeMatch?.[1] ?? '';
  }

  /**
   * Adapts filename extension to the resulting mime type.
   */
  private buildFileNameForMimeType(fileName: string, mimeType: string): string {
    const lastDotIndex = fileName.lastIndexOf('.');
    const baseName = lastDotIndex === -1 ? fileName : fileName.slice(0, lastDotIndex);

    if (mimeType === 'image/jpeg') return `${baseName}.jpg`;
    if (mimeType === 'image/png') return `${baseName}.png`;
    return fileName;
  }

  /**
   * Parses a due date string from either `YYYY/MM/DD` or `YYYY-MM-DD`.
   * @param value Date string entered in the form.
   * @returns Parsed date or `null` when the value is invalid.
   */
  private parseDueDate(value: string): Date | null {
    const parts = value.split(/[\/-]/);
    if (parts.length !== 3) return null;
    const [yearStr, monthStr, dayStr] = parts;
    const year = Number(yearStr);
    const month = Number(monthStr);
    const day = Number(dayStr);
    if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null;

    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day)
      return null;

    return date;
  }

  /**
   * Validates the title against length and minimum-letter rules.
   * @param value Title candidate from the form.
   * @returns `true` if title is valid.
   */
  private isTitleValid(value: string): boolean {
    const title = value.trim();
    return (
      title.length >= this.taskTitleMinLength &&
      title.length <= this.taskTitleMaxLength &&
      this.hasMinimumLetters(title, this.taskTitleMinLetters)
    );
  }

  /**
   * Checks whether a value contains a minimum amount of latin letters.
   * @param value Candidate input string.
   * @param minLetters Minimum amount of letters required.
   * @returns `true` when the minimum is met.
   */
  private hasMinimumLetters(value: string, minLetters: number): boolean {
    const letterMatches = value.match(/[a-z]/gi);
    return (letterMatches?.length ?? 0) >= minLetters;
  }

  /** Shows a short toast and then exits add-task flow. */
  private showToast(): void {
    this.toastVisible = true;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastVisible = false;
      if (this.isOverlay) {
        this.closeDialogRequested.emit();
        return;
      }
      this.router.navigateByUrl('/board');
    }, 2000);
  }
  // #endregion

  markAsEdited(): void {
    if (this.hasUserEdited) return;
    this.hasUserEdited = true;
    this.dirtyChange.emit(true);
  }

  resetDirtyState(): void {
    this.hasUserEdited = false;
    this.dirtyChange.emit(false);
  }

  onCloseAddTaskClick(): void {
    this.showCloseConfirm = true;
  }

  confirmClose() {
    this.showCloseConfirm = false;
  }

  cancelClose(): void {
    this.showCloseConfirm = false;
  }
}
