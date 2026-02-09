import { Component, EventEmitter, Input, OnDestroy, Output, inject } from '@angular/core';
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
export class AddTask implements OnDestroy {
  taskService = inject(TaskService);
  private router = inject(Router);
  @Input() isOverlay = false;
  @Output() closeDialogRequested = new EventEmitter<void>();

  minDueDate = getTodayDateString();
  readonly taskTitleMinLength = 3;
  readonly taskTitleMaxLength = 100;
  private readonly taskTitleRegex = /^[A-Za-zÄÖÜäöüß0-9 .,:;!?()_/#+'&"@-]+$/;

  taskTitle: Task['title'] = '';
  taskDescription: Task['description'] = '';
  taskDueDate = '';
  createdAt!: Timestamp;
  activePriority: Task['priority'] = 'medium';
  private _activeAssignees: Contact[] = [];
  activeCategory: TaskCategoryOption | null = null;
  activeSubtasks: Subtask[] = [];
  isTitleTouched = false;

  isDueDateTouched = false;
  isCategoryTouched = false;

  toastVisible = false;
  private toastTimer?: number;

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

  get activeAssignees(): Contact[] {
    return this._activeAssignees;
  }

  set activeAssignees(value: Contact[]) {
    this._activeAssignees = value;
  }

  async createTask(): Promise<void> {
    const title = this.taskTitle.trim();
    const description = this.taskDescription.trim();
    const dueDateValue = this.taskDueDate.trim();
    const category = this.activeCategory?.value ?? null;

    if (!this.isTitleValid(title) || !dueDateValue || !category || !this.hasValidSubtasks) {
      if (!this.isTitleValid(title)) this.isTitleTouched = true;
      if (!dueDateValue) this.isDueDateTouched = true;
      if (!category) this.isCategoryTouched = true;
      return;
    }

    const dueDateDate = this.parseDueDate(dueDateValue);
    if (!dueDateDate) return;
    const dueDate = Timestamp.fromDate(dueDateDate);

    const assigneeIds = this.activeAssignees
      .map((contact) => contact.id)
      .filter((id): id is string => Boolean(id));

    const toDoTasks = this.taskService.tasks.filter((task) => task.status === 'to-do');
    const newOrder = toDoTasks.length;

    const task: Task = {
      status: 'to-do',
      order: newOrder,
      title,
      description,
      dueDate,
      priority: this.activePriority,
      assignees: assigneeIds,
      category,
      subtasks: this.activeSubtasks.map((subtask) => ({ ...subtask })),
    };

    await this.taskService.addDocument(task);
    this.resetForm();
    this.showToast();
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

  ngOnDestroy(): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }
}
