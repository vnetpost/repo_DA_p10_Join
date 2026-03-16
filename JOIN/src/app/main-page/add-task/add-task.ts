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
import { getTodayDateString } from '../../shared/utilities/utils';
import { ContactService } from '../../shared/services/contact.service';
import {
  ADD_TASK_TITLE_MAX_LENGTH,
  ADD_TASK_TITLE_MIN_LETTERS,
  isAddTaskTitleValid,
  validateAddTaskForm,
} from './add-task-validation.utils';
import {
  mapTaskToAddTaskFormState,
} from './add-task-mapper.utils';
import { AddTaskUiState } from './add-task-ui-state';
import { AddTaskSubmitService } from './add-task-submit.service';

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
  private addTaskSubmitService = inject(AddTaskSubmitService);
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
  private readonly uiState: AddTaskUiState;
  // #endregion

  // #region Constants
  minDueDate = getTodayDateString();
  readonly taskTitleMaxLength = ADD_TASK_TITLE_MAX_LENGTH;
  readonly taskTitleMinLetters = ADD_TASK_TITLE_MIN_LETTERS;
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
  isSubmitting = false;
  attachmentUploadError = '';
  formResetVersion = 0;
  // #endregion

  constructor() {
    this.uiState = new AddTaskUiState(
      (isDirty) => this.dirtyChange.emit(isDirty),
      () => this.closeDialogRequested.emit(),
      () => this.router.navigateByUrl('/board')
    );
  }

  // #region Lifecycle
  /** Applies incoming task data to the form whenever edit input changes. */
  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['taskToEdit']) return;
    if (this.taskToEdit) this.populateFormForEdit(this.taskToEdit);
    else this.resetForm();
  }

  /** Clears running timers to avoid side effects after component teardown. */
  ngOnDestroy(): void {
    this.uiState.destroy();
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
    return title.length > 0 && !isAddTaskTitleValid(title);
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
      isAddTaskTitleValid(this.taskTitle) &&
      this.taskDueDate.trim().length > 0 &&
      Boolean(this.activeCategory)
    );
  }

  /** Exposes current toast visibility for the template. */
  get toastVisible(): boolean {
    return this.uiState.toastVisible;
  }

  /** Exposes current close-confirm state for the template. */
  get showCloseConfirm(): boolean {
    return this.uiState.showCloseConfirm;
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
    const validatedCategory = validateAddTaskForm(
      title,
      dueDateValue,
      this.activeCategory?.value ?? null,
    );

    if (!validatedCategory) {
      if (!isAddTaskTitleValid(title)) this.isTitleTouched = true;
      if (!dueDateValue) this.isDueDateTouched = true;
      if (!this.activeCategory?.value) this.isCategoryTouched = true;
      return;
    }

    const dueDateDate = this.parseDueDate(dueDateValue);
    if (!dueDateDate) return;
    this.isSubmitting = true;

    try {
      this.attachmentUploadError = '';
      const submissionResult = await this.addTaskSubmitService.submitTask({
        taskToEdit: this.taskToEdit,
        initialStatus: this.initialStatus,
        title,
        description,
        dueDate: dueDateDate,
        priority: this.activePriority,
        activeAssignees: this.activeAssignees,
        category: validatedCategory,
        activeSubtasks: this.activeSubtasks,
        editableExistingAttachments: this.editableExistingAttachments,
        selectedAttachments: this.selectedAttachments,
      });

      this.attachmentUploadError = [submissionResult.errorMessage, submissionResult.warningMessage]
        .filter(Boolean)
        .join(' ');
      this.selectedAttachments = submissionResult.selectedAttachments;
      if (!submissionResult.persistedTask) return;
      if (submissionResult.shouldResetForm) this.resetForm();

      this.taskSaved.emit(submissionResult.persistedTask);
      this.uiState.showSuccessToast(this.isOverlay);
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
    const formState = mapTaskToAddTaskFormState(
      task,
      this.contactService.contacts,
      this.taskService.taskCategories
    );

    this.taskTitle = formState.taskTitle;
    this.taskDescription = formState.taskDescription;
    this.taskDueDate = formState.taskDueDate;
    this.activePriority = formState.activePriority;
    this.activeAssignees = formState.activeAssignees;
    this.activeCategory = formState.activeCategory;
    this.activeSubtasks = formState.activeSubtasks;
    this.editableExistingAttachments = formState.editableExistingAttachments;
    this.selectedAttachments = [];
    this.attachmentUploadError = '';
    this.isTitleTouched = false;
    this.isDueDateTouched = false;
    this.isCategoryTouched = false;
    this.resetDirtyState();
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
   * Marks the add-task form as modified.
   *
   * @returns void
   */
  markAsEdited(): void {
    this.uiState.markAsEdited();
  }

  /**
   * Clears the dirty-state tracking for the add-task dialog.
   *
   * @returns void
   */
  resetDirtyState(): void {
    this.uiState.resetDirtyState();
  }

  /**
   * Requests the close confirmation for the add-task dialog.
   *
   * @returns void
   */
  onCloseAddTaskClick(): void {
    this.uiState.requestCloseConfirm();
  }

  /**
   * Confirms closing the add-task dialog and clears the confirmation state.
   *
   * @returns void
   */
  confirmClose(): void {
    this.uiState.clearCloseConfirm();
  }

  /**
   * Cancels the pending close action for the add-task dialog.
   *
   * @returns void
   */
  cancelClose(): void {
    this.uiState.clearCloseConfirm();
  }
}
