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
/**
 * Board component
 *
 * Represents the main task board view.
 * Handles task searching, opening task details,
 * deleting tasks, and managing the add-task overlay.
 */
export class Board {
  taskService = inject(TaskService);
  searchTerm: string = '';
  isAddTaskOverlayOpen = false;
  taskToEdit: Task | null = null;
  addTaskStatus: Task['status'] = 'to-do';
  @ViewChild('taskDialog') taskDialog!: TaskDialog;
  selectedTask!: Task;

  /**
   * Performs a search based on the current search term.
   *
   * Updates the search term in the task service
   * after trimming and normalizing the input.
   *
   * @returns void
   */
  search(): void {
    this.taskService.setSearchTerm(this.searchTerm.trim().toLowerCase());
  }

  /**
   * Opens the task dialog for the selected task.
   *
   * Sets the selected task and triggers the dialog display.
   *
   * @param task The task to open in the dialog
   * @returns void
   */
  openTask(task: Task): void {
    this.selectedTask = task;

    setTimeout(() => {
      this.taskDialog.openDialog();
    });
  }

  /**
   * Deletes a task by its identifier.
   *
   * Removes the task from the data source
   * and clears the selected task state.
   *
   * @param taskId The identifier of the task to delete
   * @returns void
   */
  deleteTask(taskId: string): void {
    if (!taskId) return;

    this.taskService.deleteDocument('tasks', taskId);
    this.selectedTask = null as any;
  }

  openAddTaskOverlay(status: Task['status'] = 'to-do'): void {
    this.taskToEdit = null;
    this.addTaskStatus = status;
    this.isAddTaskOverlayOpen = true;
  }

  openEditTaskOverlay(task: Task): void {
    this.taskToEdit = task;
    this.addTaskStatus = task.status;
    this.isAddTaskOverlayOpen = true;
  }

  /**
   * Closes the add-task overlay.
   *
   * @returns void
   */
  closeAddTaskOverlay(): void {
    const editedTask = this.taskToEdit;
    this.isAddTaskOverlayOpen = false;
    this.taskToEdit = null;
    this.addTaskStatus = 'to-do';

    if (editedTask?.id) {
      this.openTask(this.taskService.tasks.find((task) => task.id === editedTask.id) ?? editedTask);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isAddTaskOverlayOpen) this.closeAddTaskOverlay();
  }
}
