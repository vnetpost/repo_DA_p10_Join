import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Subtask } from '../../../shared/interfaces/task';

@Component({
  selector: 'app-subtask-composer',
  imports: [],
  templateUrl: './subtask-composer.html',
  styleUrl: './subtask-composer.scss',
})
export class SubtaskComposer {
  @Input() subtasks: Subtask[] = [];
  @Output() subtasksChange = new EventEmitter<Subtask[]>();

  subtaskTitle = '';
  editingIndex: number | null = null;

  get hasSubtaskInput(): boolean {
    return this.subtaskTitle.trim().length > 0;
  }

  addSubtask(): void {
    const title = this.subtaskTitle.trim();
    if (!title) return;
    if (this.editingIndex !== null) {
      const updated = this.subtasks.map((subtask, index) =>
        index === this.editingIndex ? { ...subtask, title } : subtask,
      );
      this.subtasks = updated;
      this.subtasksChange.emit(updated);
      this.editingIndex = null;
      this.subtaskTitle = '';
      return;
    }
    const updated = [...this.subtasks, { title, done: false }];
    this.subtasks = updated;
    this.subtasksChange.emit(updated);
    this.subtaskTitle = '';
  }

  clearSubtaskTitle(): void {
    this.subtaskTitle = '';
    this.editingIndex = null;
  }

  startEditSubtask(index: number): void {
    const subtask = this.subtasks[index];
    if (!subtask) return;
    this.subtaskTitle = subtask.title;
    this.editingIndex = index;
  }

  removeSubtask(index: number): void {
    const updated = this.subtasks.filter((_, subtaskIndex) => subtaskIndex !== index);
    this.subtasks = updated;
    this.subtasksChange.emit(updated);
    if (this.editingIndex === index) {
      this.editingIndex = null;
      this.subtaskTitle = '';
    } else if (this.editingIndex !== null && this.editingIndex > index) {
      this.editingIndex -= 1;
    }
  }
}
