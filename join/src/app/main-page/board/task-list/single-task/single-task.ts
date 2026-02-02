import { Component, inject, Input } from '@angular/core';
import { Task } from '../../../../shared/interfaces/task';
import { FirebaseService } from '../../../../shared/services/firebase-service';
import { getTwoInitials } from '../../../../shared/utilities/utils';
import { NgClass } from '@angular/common';
import { TaskService } from '../../../../shared/services/task-service';


@Component({
  selector: 'app-single-task',
  imports: [NgClass],
  templateUrl: './single-task.html',
  styleUrl: './single-task.scss',
})
export class SingleTask {
  @Input() task!: Task;
  taskService = inject(TaskService);
  contactService = inject(FirebaseService);
  userColor: string | null = null;
  moveMenuOpen: boolean = false;

  openMenu(): void {
    this.moveMenuOpen = true;
  }

  closeMenu(): void {
    this.moveMenuOpen = false;
  }

  moveTo(status: "to-do" | "in-progress" | "await-feedback" | "done"): void {
    this.task.status = status;
    this.taskService.updateDocument(this.task, 'tasks');
    this.closeMenu();
  }

  get doneCount(): number {
    if (!this.task.subtasks) {
      return 0;
    }
    return this.task.subtasks.filter((s) => s.done).length;
  }

  get totalCount(): number {
    if (!this.task.subtasks) {
      return 0;
    }
    return this.task.subtasks.length;
  }

  getAssigneeInitials(id: string): string {
    const contact = this.contactService.contacts.find((c) => {
      return c.id === id;
    });

    return getTwoInitials(contact?.name || "Unknown");
  }

  getUserColor(id: string): string {
    const contact = this.contactService.contacts.find((c) => {
      return c.id === id;
    });

    return contact?.userColor || '#9327ff';
  }
}
