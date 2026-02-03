import { Component } from '@angular/core';
import { Contact } from '../../shared/interfaces/contact';
import { Subtask, Task } from '../../shared/interfaces/task';
import { TaskCategoryOption } from '../../shared/services/task-service';
import { DropdownAssignee } from './dropdown-assignee/dropdown-assignee';
import { DropdownCategory } from './dropdown-category/dropdown-category';
import { PrioritySelector } from './priority-selector/priority-selector';
import { SubtaskComposer } from './subtask-composer/subtask-composer';
import { TaskFormField } from './task-form-field/task-form-field';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-add-task',
  imports: [TaskFormField, PrioritySelector, DropdownAssignee, DropdownCategory, SubtaskComposer],
  templateUrl: './add-task.html',
  styleUrl: './add-task.scss',
})
export class AddTask {
  taskTitle: Task['title'] = '';
  taskDescription: Task['description'] = '';
  createdAt!: Timestamp;
  activePriority: Task['priority'] = 'medium';
  private _activeAssignees: Contact[] = [];
  activeCategory: TaskCategoryOption | null = null;
  activeSubtasks: Subtask[] = [];

  get activeAssignees(): Contact[] {
    return this._activeAssignees;
  }

  set activeAssignees(value: Contact[]) {
    this._activeAssignees = value;
    console.log('activeAssignees', value);
  }
}
