import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Subtask } from '../../../../shared/interfaces/task';

/**
 * Renders subtasks inside the task dialog.
 */
@Component({
  selector: 'app-task-dialog-subtasks',
  imports: [],
  templateUrl: './task-dialog-subtasks.html',
  styleUrl: './task-dialog-subtasks.scss',
})
export class TaskDialogSubtasks {
  @Input() subtasks: Subtask[] = [];
  @Output() toggleSubtask = new EventEmitter<number>();

  /**
   * Emits the index of the subtask that should be toggled.
   *
   * @param index Index of the clicked subtask.
   * @returns void
   */
  onToggle(index: number): void {
    this.toggleSubtask.emit(index);
  }
}
