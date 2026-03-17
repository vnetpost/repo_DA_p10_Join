import { Component, HostListener, inject, ViewChild } from '@angular/core';
import { TaskList } from './components/task-list/task-list';
import { TaskService } from '../../shared/services/task.service';
import { FormsModule } from '@angular/forms';
import { TaskDialog } from './components/task-dialog/task-dialog';
import { Task } from '../../shared/interfaces/task';
import { AddTask } from '../add-task/add-task';
import { BoardUiState } from './state/board-ui-state';

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
 * deleting tasks, and managing the add-task overlay
 * including edit and close confirmation behavior.
 */
export class Board {
  taskService = inject(TaskService);
  searchTerm: string = '';
  @ViewChild('taskDialog') taskDialog!: TaskDialog;
  selectedTask!: Task;
  private readonly uiState = new BoardUiState();

  /**
   * Indicates whether the add-task overlay is currently open.
   *
   * @returns `true` when the overlay is visible.
   */
  get isAddTaskOverlayOpen(): boolean {
    return this.uiState.isAddTaskOverlayOpen;
  }

  /**
   * Exposes the task currently being edited inside the overlay.
   *
   * @returns Task being edited or `null`.
   */
  get taskToEdit(): Task | null {
    return this.uiState.taskToEdit;
  }

  /**
   * Exposes the target status for newly created tasks.
   *
   * @returns Initial task status for the overlay form.
   */
  get addTaskStatus(): Task['status'] {
    return this.uiState.addTaskStatus;
  }

  /**
   * Indicates whether the close-confirmation prompt is visible.
   *
   * @returns `true` when the close confirmation is shown.
   */
  get showCloseConfirm(): boolean {
    return this.uiState.showCloseConfirm;
  }

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

  /**
   * Opens the add-task overlay in create mode.
   *
   * Resets edit state and sets the initial status
   * for the new task.
   *
   * @param status The status the new task should start with
   * @returns void
   */
  openAddTaskOverlay(status: Task['status'] = 'to-do'): void {
    this.uiState.openCreateOverlay(status);
  }

  /**
   * Opens the add-task overlay in edit mode.
   *
   * Loads the selected task into the overlay
   * for editing.
   *
   * @param task The task to edit
   * @returns void
   */
  openEditTaskOverlay(task: Task): void {
    this.uiState.openEditOverlay(task);
  }

  /**
   * Receives the latest persisted task from the add-task form.
   *
   * @param task Newly created or updated task.
   * @returns void
   */
  onTaskSaved(task: Task): void {
    this.uiState.setLatestSavedTask(task);
  }

  /**
   * Updates the dirty state of the add-task overlay.
   *
   * @param isDirty Indicates whether the form has unsaved changes
   * @returns void
   */
  onAddTaskDirtyChange(isDirty: boolean): void {
    this.uiState.setDirty(isDirty);
  }

  /**
   * Confirms closing of the add-task overlay.
   *
   * Resets confirmation state and closes the overlay.
   *
   * @returns void
   */
  confirmClose(): void {
    this.closeAddTaskOverlay();
  }

  /**
   * Cancels the close confirmation dialog.
   *
   * @returns void
   */
  cancelClose(): void {
    this.uiState.cancelCloseConfirm();
  }

  /**
   * Handles explicit close requests for the add-task overlay.
   *
   * Shows a confirmation dialog if unsaved changes exist.
   *
   * @returns void
   */
  onCloseAddTaskClick(): void {
    if (this.uiState.requestClose()) this.closeAddTaskOverlay();
  }

  /**
   * Handles mouse interactions on the add-task overlay backdrop.
   *
   * Closes the overlay or shows a confirmation dialog
   * depending on the dirty state.
   *
   * @param event The mouse event triggered by the interaction
   * @returns void
   */
  onAddTaskOverlayMouseDown(event: MouseEvent): void {
    if (event.target !== event.currentTarget) return;
    if (this.uiState.requestClose()) this.closeAddTaskOverlay();
  }

  /**
   * Handles the Escape key interaction.
   *
   * Closes the add-task overlay or opens a confirmation
   * dialog if unsaved changes are present.
   *
   * @returns void
   */
  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (!this.isAddTaskOverlayOpen || this.showCloseConfirm) return;
    if (this.uiState.requestClose()) this.closeAddTaskOverlay();
  }

  /**
   * Closes the add-task overlay.
   *
   * Resets overlay state and reopens the task dialog
   * when returning from edit mode.
   *
   * @returns void
   */
  closeAddTaskOverlay(): void {
    const { editedTask, latestSavedTask } = this.uiState.closeOverlay();

    const taskIdToReopen = latestSavedTask?.id ?? editedTask?.id;
    if (taskIdToReopen) {
      const freshestTask = this.taskService.tasks.find((task) => task.id === taskIdToReopen);
      const taskToOpen = freshestTask ?? latestSavedTask ?? editedTask;
      if (!taskToOpen) return;
      this.openTask(taskToOpen);
    }
  }
}
