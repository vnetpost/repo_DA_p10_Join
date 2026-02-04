import { Component, inject } from '@angular/core';
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
export class AddTask {
  taskService = inject(TaskService);

  minDueDate = this.getTodayDateString();

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

  get hasMinSubtasks(): boolean {
    return this.activeSubtasks.length >= 2;
  }

  get showSubtaskHint(): boolean {
    return this.activeSubtasks.length === 1;
  }

  get showTitleError(): boolean {
    return this.isTitleTouched && !this.taskTitle.trim();
  }

  get showDueDateError(): boolean {
    return this.isDueDateTouched && !this.taskDueDate.trim();
  }

  get showCategoryError(): boolean {
    return this.isCategoryTouched && !this.activeCategory;
  }

  get isFormValid(): boolean {
    return (
      this.taskTitle.trim().length > 0 &&
      this.taskDueDate.trim().length > 0 &&
      Boolean(this.activeCategory) &&
      this.hasMinSubtasks
    );
  }

  get activeAssignees(): Contact[] {
    return this._activeAssignees;
  }

  set activeAssignees(value: Contact[]) {
    this._activeAssignees = value;
    console.log('activeAssignees', value);
  }

  async createTask(): Promise<void> {
    const title = this.taskTitle.trim();
    const description = this.taskDescription.trim();
    const dueDateValue = this.taskDueDate.trim();
    const category = this.activeCategory?.value ?? null;

    if (!title || !dueDateValue || !category || !this.hasMinSubtasks) {
      if (!title) this.isTitleTouched = true;
      if (!dueDateValue) this.isDueDateTouched = true;
      if (!category) this.isCategoryTouched = true;
      return;
    }

    const dueDate = Timestamp.fromDate(new Date(`${dueDateValue}T00:00:00`));
    if (Number.isNaN(dueDate.toDate().getTime())) return;

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

  private getTodayDateString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
