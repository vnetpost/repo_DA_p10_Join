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

  // get tasksByStatus(): Array<Task> {
  //   return this.taskService.getFilteredTasks().filter((task) => {
  //     return task.status === this.status
  //   });
  // }

  tasksByStatus: Task[] = [];

  ngOnInit() {
    this.updateTasks();

    window.addEventListener('tasks-updated', () => {
    this.updateTasks();
  });
  }

  updateTasks() {
    this.tasksByStatus = this.taskService.getFilteredTasks()
      .filter(task => task.status === this.status);
  }

  // onDrop(event: CdkDragDrop<Array<Task>>): void {
  //   const task = event.item.data;
  //   const newIndex = event.currentIndex;

  //   task.status = this.status;
  //   task.order = newIndex;
    
  //   this.taskService.updateDocument(task, 'tasks');
  // }

onDrop(event: CdkDragDrop<Task[]>): void {
  const movedTask = event.item.data;
  const sourceTasks = event.previousContainer.data;
  const targetTasks = event.container.data;

  sourceTasks.splice(event.previousIndex, 1);
  targetTasks.splice(event.currentIndex, 0, movedTask);
  movedTask.status = this.status;

  sourceTasks.forEach((task, index) => {
    task.order = index;
    this.taskService.updateDocument(task, 'tasks');
  });

  targetTasks.forEach((task, index) => {
    task.order = index;
    this.taskService.updateDocument(task, 'tasks');
  });
}
}
