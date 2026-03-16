import { Component, ElementRef, EventEmitter, inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Task } from '../../../../shared/interfaces/task';
import { ContactService } from '../../../../shared/services/contact.service';
import {
  getContactDisplayAvatarSrcById,
  getContactDisplayColorById,
  getContactDisplayInitialsById,
} from '../../../../shared/utilities/contact-presenter.utils';
import { NgClass } from '@angular/common';
import { TaskService } from '../../../../shared/services/task.service';
import { CdkDrag, DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-task-card',
  imports: [NgClass, DragDropModule, CdkDrag],
  templateUrl: './task-card.html',
  styleUrl: './task-card.scss',
})
/**
 * TaskCard component
 *
 * Represents an individual task card within a task list.
 * Handles mobile detection, task movement between statuses,
 * and displays task-related information such as assignees
 * and subtask progress.
 */
export class TaskCard implements OnInit {
  @Input() task!: Task;
  taskService = inject(TaskService);
  contactService = inject(ContactService);
  readonly getAssigneeInitials = (id: string): string =>
    getContactDisplayInitialsById(this.contactService.contacts, id);
  readonly getUserColor = (id: string): string =>
    getContactDisplayColorById(this.contactService.contacts, id);
  readonly getAssigneeAvatarSrc = (id: string): string | null =>
    getContactDisplayAvatarSrcById(this.contactService.contacts, id);
  moveMenuOpen: boolean = false;
  isMobile = false;
  @Output() openTask = new EventEmitter<Task>();

  /**
   * Stable element id for the mobile move menu of this task card.
   */
  get moveMenuId(): string {
    return this.task.id ? `move-menu-${this.task.id}` : `move-menu-${this.task.order}`;
  }

  /**
   * Initializes the component.
   *
   * Detects the current device type and listens
   * for resize events to update the device state.
   *
   * @returns void
   */
  ngOnInit(): void {
    this.checkDevice();
    window.addEventListener('resize', () => this.checkDevice());
  }

  /**
   * Checks whether the current device is a mobile device.
   *
   * Updates the mobile state based on pointer
   * and hover capabilities.
   *
   * @returns void
   */
  checkDevice(): void {
    this.isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  }

  /**
   * Opens the move menu for the task.
   *
   * @param event The mouse event triggering the menu
   * @returns void
   */
  openMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.moveMenuOpen = true;
  }

  /**
   * Closes the move menu for the task.
   *
   * @param event The mouse event triggering the close action
   * @returns void
   */
  closeMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.moveMenuOpen = false;
  }

  /**
   * Moves the task to a different status.
   *
   * Updates the order of tasks in the target list
   * and persists the changes through the task service.
   *
   * @param status The target status for the task
   * @param event The mouse event triggering the action
   * @returns void
   */
  moveTo(status: 'to-do' | 'in-progress' | 'await-feedback' | 'done', event: MouseEvent): void {
    const otherTasks = this.taskService.tasks.filter(
      t => t.status === status && t.id !== this.task.id
    );
    
    for (const t of otherTasks) {
      t.order = t.order + 1;
      this.taskService.updateDocument(t, 'tasks');
    }
    
    this.task.status = status;
    this.task.order = 0;
    this.taskService.updateDocument(this.task, 'tasks');
    this.closeMenu(event);
  }

  /**
   * Returns the number of completed subtasks.
   *
   * @returns The count of subtasks marked as done
   */
  get doneCount(): number {
    if (!this.task.subtasks) {
      return 0;
    }
    return this.task.subtasks.filter((s) => s.done).length;
  }

  /**
   * Returns the total number of subtasks.
   *
   * @returns The total subtask count
   */
  get totalCount(): number {
    if (!this.task.subtasks) {
      return 0;
    }
    return this.task.subtasks.length;
  }

}
