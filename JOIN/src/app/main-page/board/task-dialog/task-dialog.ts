import { Component, ElementRef, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { Task } from '../../../shared/interfaces/task';
import { ContactService } from '../../../shared/services/contact.service';
import {
  getContactDisplayAvatarSrcById,
  getContactDisplayColorById,
  getContactDisplayInitialsById,
  getContactDisplayNameById,
} from '../../../shared/utilities/contact-presenter.utils';
import { TaskDialogUiState } from './task-dialog-ui-state';
import { TaskDialogSubtaskService } from './task-dialog-subtask.service';
import { TaskDialogAttachments } from './task-dialog-attachments/task-dialog-attachments';

@Component({
  selector: 'app-task-dialog',
  imports: [NgClass, DatePipe, TaskDialogAttachments],
  templateUrl: './task-dialog.html',
  styleUrl: './task-dialog.scss',
})
/**
 * TaskDialog component
 *
 * Represents a modal dialog displaying detailed information
 * about a task. Handles edit and delete actions, subtask updates,
 * and dialog interactions.
 */
export class TaskDialog {
  private readonly noop = (): void => {};
  @ViewChild('taskDialog') dialog!: ElementRef<HTMLDialogElement>;
  contactService = inject(ContactService);
  subtaskService = inject(TaskDialogSubtaskService);
  readonly getAssigneeInitials = (id: string): string =>
    getContactDisplayInitialsById(this.contactService.contacts, id);
  readonly getAssigneeName = (id: string): string =>
    getContactDisplayNameById(this.contactService.contacts, id);
  readonly getUserColor = (id: string): string =>
    getContactDisplayColorById(this.contactService.contacts, id);
  readonly getAssigneeAvatarSrc = (id: string): string | null =>
    getContactDisplayAvatarSrcById(this.contactService.contacts, id);
  @Input() task!: Task;
  @Output() deleteTask = new EventEmitter<string>();
  @Output() editTask = new EventEmitter<Task>();
  private readonly uiState = new TaskDialogUiState();

  /** Exposes current delete-confirm visibility for the template. */
  get showDeleteConfirm(): boolean {
    return this.uiState.showDeleteConfirm;
  }

  /**
   * Opens the task dialog.
   *
   * Displays the dialog as a modal window
   * and applies the active dialog styling.
   *
   * @returns void
   */
  openDialog(): void {
    this.uiState.openDialog(this.dialog.nativeElement, this.noop);
  }

  /**
   * Initiates the delete confirmation state.
   *
   * @returns void
   */
  onDeleteClick(): void {
    this.uiState.requestDeleteConfirm();
  }

  /**
   * Triggers the edit action for the current task.
   *
   * Closes the dialog and emits the edit event
   * with the selected task.
   *
   * @returns void
   */
  onEditClick(): void {
    this.closeDialog();
    this.editTask.emit(this.task);
  }

  /**
   * Confirms deletion of the current task.
   *
   * Emits the delete event, resets the confirmation state,
   * and closes the dialog.
   *
   * @returns void
   */
  confirmDelete(): void {
    this.uiState.confirmDelete(() => this.deleteTask.emit(this.task.id), () => this.closeDialog());
  }

  /**
   * Cancels the delete confirmation.
   *
   * @returns void
   */
  cancelDelete(): void {
    this.uiState.clearDeleteConfirm();
  }

  /**
   * Closes the dialog.
   *
   * Removes the active dialog state and
   * closes the native dialog element.
   *
   * @returns void
   */
  closeDialog(): void {
    this.uiState.closeDialog(this.dialog.nativeElement, this.noop);
  }

  /**
   * Handles clicks on the dialog backdrop.
   *
   * Closes the dialog only when the backdrop
   * itself is clicked.
   *
   * @param event The mouse event triggered by the click
   * @returns void
   */
  onBackdropClick(event: MouseEvent): void {
    this.uiState.handleBackdropClick(event, this.dialog.nativeElement, () => this.closeDialog());
  }

  /**
   * Handles the Escape key interaction.
   *
   * Prevents the default browser behavior
   * and closes the dialog manually.
   *
   * @param event The triggered escape event
   * @returns void
   */
  onEsc(event: Event): void {
    this.uiState.handleEscape(event, () => this.closeDialog());
  }

  /**
   * Toggles the completion state of a subtask.
   *
   * Updates the subtask status and persists
   * the changes through the task service.
   *
   * @param index The index of the subtask to toggle
   * @returns void
   */
  toggleSubtask(index: number): void {
    this.subtaskService.toggleSubtask(this.task, index);
  }
}
