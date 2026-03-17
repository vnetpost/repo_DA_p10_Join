import { Task } from '../../../shared/interfaces/task';

/**
 * Encapsulates transient overlay and confirmation state for the task board.
 */
export class TasksBoardUiState {
  isAddTaskOverlayOpen = false;
  taskToEdit: Task | null = null;
  addTaskStatus: Task['status'] = 'to-do';
  showCloseConfirm = false;
  isAddTaskDirty = false;
  latestSavedTask: Task | null = null;

  /**
   * Opens the add-task overlay in create mode.
   *
   * @param status Initial status for the new task.
   * @returns void
   */
  openCreateOverlay(status: Task['status']): void {
    this.taskToEdit = null;
    this.latestSavedTask = null;
    this.addTaskStatus = status;
    this.isAddTaskOverlayOpen = true;
  }

  /**
   * Opens the add-task overlay in edit mode for one task.
   *
   * @param task Task that should be edited.
   * @returns void
   */
  openEditOverlay(task: Task): void {
    this.taskToEdit = task;
    this.latestSavedTask = null;
    this.addTaskStatus = task.status;
    this.isAddTaskOverlayOpen = true;
  }

  /**
   * Stores the latest saved task returned by the overlay form.
   *
   * @param task Newly created or updated task.
   * @returns void
   */
  setLatestSavedTask(task: Task): void {
    this.latestSavedTask = task;
  }

  /**
   * Updates the dirty state of the overlay form.
   *
   * @param isDirty Whether unsaved changes are present.
   * @returns void
   */
  setDirty(isDirty: boolean): void {
    this.isAddTaskDirty = isDirty;
  }

  /**
   * Requests closing of the overlay and opens confirmation when needed.
   *
   * @returns `true` when the overlay may close immediately.
   */
  requestClose(): boolean {
    if (!this.isAddTaskDirty) return true;
    this.showCloseConfirm = true;
    return false;
  }

  /**
   * Hides the close-confirmation prompt.
   *
   * @returns void
   */
  cancelCloseConfirm(): void {
    this.showCloseConfirm = false;
  }

  /**
   * Resets overlay state and returns the tasks relevant for a reopen flow.
   *
   * @returns The edited and latest saved task before the reset.
   */
  closeOverlay(): { editedTask: Task | null; latestSavedTask: Task | null } {
    const editedTask = this.taskToEdit;
    const latestSavedTask = this.latestSavedTask;

    this.isAddTaskOverlayOpen = false;
    this.taskToEdit = null;
    this.latestSavedTask = null;
    this.addTaskStatus = 'to-do';
    this.isAddTaskDirty = false;
    this.showCloseConfirm = false;

    return { editedTask, latestSavedTask };
  }
}
