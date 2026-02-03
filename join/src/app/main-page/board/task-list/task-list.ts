import { Component, inject, Input } from '@angular/core';
import { TaskService } from '../../../shared/services/task-service';
import { SingleTask } from './single-task/single-task';
import { FirebaseService } from '../../../shared/services/firebase-service';
import { Task } from '../../../shared/interfaces/task';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-task-list',
  imports: [SingleTask, DragDropModule],
  templateUrl: './task-list.html',
  styleUrl: './task-list.scss',
})
export class TaskList {
  taskService = inject(TaskService);
  contactService = inject(FirebaseService);

  @Input() status: string = "";
  @Input() listTitle: string = "";

  connectedLists: Array<string> = ['to-do', 'in-progress', 'await-feedback', 'done'];

  get tasksByStatus(): Array<Task> {
    return this.taskService.getFilteredTasks().filter((task) => {
      return task.status === this.status
    });
  }

  onDrop(event: CdkDragDrop<Array<Task>>): void {
    const task = event.item.data;
    task.status = this.status;
    this.taskService.updateDocument(task, 'tasks');
  }
}
