import { Component, HostListener, inject, ViewChild } from '@angular/core';
import { TaskList } from './task-list/task-list';
import { TaskService } from '../../shared/services/task-service';
import { Timestamp } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { TaskDialog } from './task-dialog/task-dialog';
import { Task } from '../../shared/interfaces/task';
import { AddTask } from '../add-task/add-task';

@Component({
  selector: 'app-board',
  imports: [TaskList, FormsModule, TaskDialog, AddTask],
  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class Board {
  taskService = inject(TaskService);
  searchTerm: string = '';
  isAddTaskOverlayOpen = false;
  @ViewChild('taskDialog') taskDialog!: TaskDialog;
  selectedTask!: Task;

  search(): void {
    this.taskService.setSearchTerm(this.searchTerm.trim().toLowerCase());
  }

  addTestTask(status: 'to-do' | 'in-progress' | 'await-feedback' | 'done'): void {
    const toDoTasks = this.taskService.tasks.filter((t) => t.status === status);
    const newOrder = toDoTasks.length;

    this.taskService.addDocument({
      status: status,
      order: newOrder,
      title: 'Kochwelt Page & Recipe RecommenderRecommenderRecommenderRecommender',
      description:
        'Build start page with recipe recommendation Build start page with recipe recommendation. Kochwelt Page & Recipe RecommenderRecommenderRecommenderRecommenderKochwelt Page & Recipe RecommenderRecommenderRecommenderRecommender Kochwelt Page & Recipe RecommenderRecommenderRecommenderRecommender.',
      dueDate: Timestamp.fromDate(new Date(2026, 7, 20)),
      priority: 'low',
      assignees: [
        '1cDGsRRbp59SsjtonS2I',
        'V2aQbKVzF7eFPsZfdhxB',
        'V2aQbKVzF7eFPsZfdhxB',
        'V2aQbKVzF7eFPsZfdhxB',
        'V2aQbKVzF7eFPsZfdhxB',
        'V2aQbKVzF7eFPsZfdhxB',
        'V2aQbKVzF7eFPsZfdhxB',
        'V2aQbKVzF7eFPsZfdhxB',
      ],
      category: 'technical-task',
      subtasks: [
        {
          title: 'Kochwelt Page & Recipe RecommenderRecommenderRecommenderRecommender',
          done: false,
        },
        { title: 'Sub 2', done: true },
        { title: 'Sub 2', done: true },
        { title: 'recipe recommendation Build start page', done: true },
        { title: 'Sub 2', done: true },
        {
          title: 'Kochwelt Page & Recipe RecommenderRecommenderRecommenderRecommender',
          done: true,
        },
        { title: 'Sub 2', done: true },
        { title: 'Sub 2', done: true },
      ],
    });
    // this.taskService.addDocument({
    //   status: status,
    //   order: newOrder,
    //   title: 'Test Task',
    //   description: 'Test Description Test Description Test Description',
    //   dueDate: Timestamp.fromDate(new Date(2026, 7, 20)),
    //   priority: 'low',
    //   assignees: ['V2aQbKVzF7eFPsZfdhxB'],
    //   category: 'technical-task',
    //   subtasks: [
    //     { title: 'Sub 1', done: false },
    //     { title: 'Sub 2', done: true },
    //   ],
    // });
  }

  openTask(task: Task) {
    this.selectedTask = task;

    setTimeout(() => {
      this.taskDialog.openDialog();
    });
  }

  deleteTask(taskId: string): void {
    if (!taskId) return;

    this.taskService.deleteDocument('tasks', taskId);
    this.selectedTask = null as any;
  }

  openAddTaskOverlay(): void {
    this.isAddTaskOverlayOpen = true;
  }

  closeAddTaskOverlay(): void {
    this.isAddTaskOverlayOpen = false;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isAddTaskOverlayOpen) this.closeAddTaskOverlay();
  }
}
