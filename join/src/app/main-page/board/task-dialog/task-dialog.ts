import { Component, ElementRef, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
import { getTwoInitials } from '../../../shared/utilities/utils';
import { DatePipe, NgClass } from '@angular/common';
import { Task } from '../../../shared/interfaces/task';
import { TaskService } from '../../../shared/services/task-service';
import { FirebaseService } from '../../../shared/services/firebase-service';

@Component({
  selector: 'app-task-dialog',
  imports: [NgClass, DatePipe],
  templateUrl: './task-dialog.html',
  styleUrl: './task-dialog.scss',
})
export class TaskDialog {
  @ViewChild('taskDialog') dialog!: ElementRef<HTMLDialogElement>;
  taskService = inject(TaskService);
  contactService = inject(FirebaseService);
  readonly getTwoInitials = getTwoInitials;
  userColor: string | null = null;
  @Input() task!: Task;
  @Output() deleteTask = new EventEmitter<string>();
  showDeleteConfirm = false;

  openDialog(): void {
    const el = this.dialog.nativeElement;
    el.showModal();
    el.classList.add('opened');
  }

  onDeleteClick(): void {
    this.showDeleteConfirm = true;
  }

  confirmDelete() {
    this.deleteTask.emit(this.task.id);
    this.showDeleteConfirm = false;
    this.closeDialog();
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
  }

  closeDialog(): void {
    const el = this.dialog.nativeElement;
    el.classList.remove('opened');
    el.close();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === this.dialog.nativeElement) {
      this.closeDialog();
    }
  }

  onEsc(event: Event): void {
    event.preventDefault();
    this.closeDialog();
  }

  getAssigneeInitials(id: string): string {
    const contact = this.contactService.contacts.find((c) => {
      return c.id === id;
    });

    return getTwoInitials(contact?.name || "Unknown");
  }

  getAssigneeName(id: string): string {
    const contact = this.contactService.contacts.find((c) => {
      return c.id === id
    });

    return contact?.name || 'Unknown';
  }

  getUserColor(id: string): string {
    const contact = this.contactService.contacts.find((c) => {
      return c.id === id;
    });

    return contact?.userColor || '#9327ff';
  }

  toggleSubtask(index: number) {
    this.task.subtasks[index].done = !this.task.subtasks[index].done;

    this.taskService.updateSubtasks(this.task);
  }
}
