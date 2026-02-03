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

  addSubtask(): void {
    const title = this.subtaskTitle.trim();
    if (!title) return;
    this.subtasks = [...this.subtasks, { title, done: false }];
    this.subtasksChange.emit(this.subtasks);
    this.subtaskTitle = '';
  }
}
