import { Component, inject, Input } from '@angular/core';
import { TaskService } from '../../../shared/services/task-service';
import { SingleTask } from './single-task/single-task';
import { FirebaseService } from '../../../shared/services/firebase-service';

@Component({
  selector: 'app-task-list',
  imports: [SingleTask,],
  templateUrl: './task-list.html',
  styleUrl: './task-list.scss',
})
export class TaskList {
  taskService = inject(TaskService);
  contactService = inject(FirebaseService);

  @Input() status: string = "";
  @Input() listTitle: string = "";

  get tasksByStatus() {
    return this.taskService.tasks.filter(task => {
      return task.status === this.status;
    });
  }
}
