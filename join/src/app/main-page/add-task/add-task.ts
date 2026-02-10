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
import { Subtask, Task } from '../../shared/interfaces/task';
import { TaskCategoryOption, TaskService } from '../../shared/services/task-service';
import { DropdownAssignee } from './dropdown-assignee/dropdown-assignee';
import { DropdownCategory } from './dropdown-category/dropdown-category';
import { PrioritySelector } from './priority-selector/priority-selector';
import { SubtaskComposer } from './subtask-composer/subtask-composer';
import { TaskFormField } from './task-form-field/task-form-field';
import { Timestamp } from '@angular/fire/firestore';
import { getTodayDateString } from '../../shared/utilities/utils';
import { FirebaseService } from '../../shared/services/firebase-service';

@Component({
  selector: 'app-add-task',
  imports: [
    FormsModule,
    TaskFormField,
    PrioritySelector,
    DropdownAssignee,
    DropdownCategory,
    SubtaskComposer,
  ],
  templateUrl: './add-task.html',
  styleUrl: './add-task.scss',
})
export class AddTask implements OnChanges, OnDestroy {
  // #region Dependencies
  taskService = inject(TaskService);
  private firebaseService = inject(FirebaseService);
  private router = inject(Router);
  // #endregion

  // #region Inputs & Outputs
  @Input() isOverlay = false;
  @Input() taskToEdit: Task | null = null;
  @Input() initialStatus: Task['status'] = 'to-do';
  @Output() closeDialogRequested = new EventEmitter<void>();
  // #endregion

  // #region Constants
  minDueDate = getTodayDateString();
  readonly taskTitleMinLength = 3;
  readonly taskTitleMaxLength = 100;
  private readonly taskTitleRegex = /^[A-Za-zÄÖÜäöüß0-9 .,:;!?()_/#+'&"@-]+$/;
  // #endregion

  // #region Form State
  taskTitle: Task['title'] = '';
  taskDescription: Task['description'] = '';
  taskDueDate = '';
  activePriority: Task['priority'] = 'medium';
  activeAssignees: Contact[] = [];
  activeCategory: TaskCategoryOption | null = null;
  activeSubtasks: Subtask[] = [];
  isTitleTouched = false;
  isDueDateTouched = false;
  isCategoryTouched = false;
  // #endregion

  // #region UI State
  toastVisible = false;
  private toastTimer?: number;
  // #endregion

  // #region Lifecycle
  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['taskToEdit']) return;
    if (this.taskToEdit) this.populateFormForEdit(this.taskToEdit);
    else this.resetForm();
  }

  ngOnDestroy(): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }
  // #endregion

  // #region Derived State
  get isEditMode(): boolean {
    return Boolean(this.taskToEdit?.id);
  }

  get formTitle(): string {
    return this.isEditMode ? 'Edit Task' : 'Add Task';
  }

  get submitButtonLabel(): string {
    return this.isEditMode ? 'Save' : 'Create Task';
  }

  get toastMessage(): string {
    return this.isEditMode ? 'Task updated' : 'Task created';
  }

  get hasValidSubtasks(): boolean {
    return this.activeSubtasks.length !== 1;
  }

  get showSubtaskHint(): boolean {
    return this.activeSubtasks.length === 1;
  }

  get showTitleError(): boolean {
    return this.showTitleRequiredError || this.showTitlePatternError;
  }

  get showTitleRequiredError(): boolean {
    return this.isTitleTouched && !this.taskTitle.trim();
  }

  get showTitlePatternError(): boolean {
    if (!this.isTitleTouched) return false;
    const title = this.taskTitle.trim();
    return title.length > 0 && !this.isTitleValid(title);
  }

  get titleErrorMessage(): string {
    if (this.showTitleRequiredError) return 'This field is required';
    return `Use ${this.taskTitleMinLength}-${this.taskTitleMaxLength} chars + valid symbols`;
  }

  get showDueDateError(): boolean {
    return this.isDueDateTouched && !this.taskDueDate.trim();
  }

  get showCategoryError(): boolean {
    return this.isCategoryTouched && !this.activeCategory;
  }

  get isFormValid(): boolean {
    return (
      this.isTitleValid(this.taskTitle) &&
      this.taskDueDate.trim().length > 0 &&
      Boolean(this.activeCategory) &&
      this.hasValidSubtasks
    );
  }
  // #endregion

  // #region Public Actions
  async createTask(): Promise<void> {
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
    const dueDate = Timestamp.fromDate(dueDateDate);

    const assigneeIds = this.activeAssignees
      .map((contact) => contact.id)
      .filter((id): id is string => Boolean(id));
    const taskPayload = this.buildTaskPayload(
      title,
      description,
      dueDate,
      assigneeIds,
      validatedCategory,
    );

    if (this.isEditMode && this.taskToEdit?.id) {
      const updatedTask: Task = {
        ...this.taskToEdit,
        ...taskPayload,
      };
      await this.taskService.updateDocument(updatedTask, 'tasks');
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

      await this.taskService.addDocument(task);
      this.resetForm();
    }

    this.showToast();
  }

  resetForm(): void {
    this.taskTitle = '';
    this.taskDescription = '';
    this.taskDueDate = '';
    this.activePriority = 'medium';
    this.activeAssignees = [];
    this.activeCategory = null;
    this.activeSubtasks = [];
    this.isTitleTouched = false;
    this.isDueDateTouched = false;
    this.isCategoryTouched = false;
  }
  // #endregion

  // #region Private Helpers
  private populateFormForEdit(task: Task): void {
    this.taskTitle = task.title;
    this.taskDescription = task.description;
    this.taskDueDate = this.formatDateForInput(task.dueDate.toDate());
    this.activePriority = task.priority;
    this.activeAssignees = task.assignees
      .map((id) => this.firebaseService.contacts.find((contact) => contact.id === id))
      .filter((contact): contact is Contact => Boolean(contact));
    this.activeCategory =
      this.taskService.taskCategories.find((category) => category.value === task.category) ?? null;
    this.activeSubtasks = task.subtasks.map((subtask) => ({ ...subtask }));
    this.isTitleTouched = false;
    this.isDueDateTouched = false;
    this.isCategoryTouched = false;
  }

  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  }

  private validateForm(
    title: Task['title'],
    dueDateValue: string,
    category: Task['category'] | null,
  ): Task['category'] | null {
    const isTitleValid = this.isTitleValid(title);

    if (!isTitleValid || !dueDateValue || !category || !this.hasValidSubtasks) {
      if (!isTitleValid) this.isTitleTouched = true;
      if (!dueDateValue) this.isDueDateTouched = true;
      if (!category) this.isCategoryTouched = true;
      return null;
    }

    return category;
  }

  private buildTaskPayload(
    title: Task['title'],
    description: Task['description'],
    dueDate: Timestamp,
    assignees: Array<string>,
    category: Task['category'],
  ): Omit<Task, 'id' | 'status' | 'order'> {
    return {
      title,
      description,
      dueDate,
      priority: this.activePriority,
      assignees,
      category,
      subtasks: [...this.activeSubtasks],
    };
  }

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

  private isTitleValid(value: string): boolean {
    const title = value.trim();
    return (
      title.length >= this.taskTitleMinLength &&
      title.length <= this.taskTitleMaxLength &&
      this.taskTitleRegex.test(title)
    );
  }

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
    }, 1200);
  }
  // #endregion
}
