import { Component, inject} from '@angular/core';
import { TaskList } from './task-list/task-list';
import { TaskService } from '../../shared/services/task-service';
import { Timestamp } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-board',
  imports: [TaskList, FormsModule],
  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class Board {
  taskService = inject(TaskService);
  searchTerm: string = '';

  search(): void {
    this.taskService.searchTerm = this.searchTerm.trim().toLowerCase();
  }

  addTestTask(status: 'to-do' | 'in-progress' | 'await-feedback' | 'done'): void {
    const toDoTasks = this.taskService.tasks.filter(t => t.status === status);
    const newOrder = toDoTasks.length;

    this.taskService.addDocument({
      status: status,
      order: newOrder,
      title: 'Test Task',
      description: 'Test Description Test Description Test Description',
      dueDate: Timestamp.fromDate(new Date(2026, 7, 20)),
      priority: 'low',
      assignees: ['V2aQbKVzF7eFPsZfdhxB'],
      category: 'technical-task',
      subtasks: [
        { title: 'Sub 1', done: false },
        { title: 'Sub 2', done: true },
      ],
    });
  }
}
