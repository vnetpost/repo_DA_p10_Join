import { Component, ElementRef, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
import { getTwoInitials } from '../../../shared/utilities/utils';
import { DatePipe, NgClass } from '@angular/common';
import { Task, TaskAttachment } from '../../../shared/interfaces/task';
import { TaskService } from '../../../shared/services/task-service';
import { FirebaseService } from '../../../shared/services/firebase-service';
import { getContactAvatarSrc } from '../../../shared/utilities/utils';

@Component({
  selector: 'app-task-dialog',
  imports: [NgClass, DatePipe],
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
  @ViewChild('taskDialog') dialog!: ElementRef<HTMLDialogElement>;
  taskService = inject(TaskService);
  contactService = inject(FirebaseService);
  readonly getTwoInitials = getTwoInitials;
  userColor: string | null = null;
  @Input() task!: Task;
  @Output() deleteTask = new EventEmitter<string>();
  @Output() editTask = new EventEmitter<Task>();
  showDeleteConfirm: boolean = false;

  /** Returns all available attachments for the active task. */
  get attachments(): TaskAttachment[] {
    return this.task?.attachments ?? [];
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
    const el = this.dialog.nativeElement;
    el.showModal();
    el.classList.add('opened');
  }

  /**
   * Initiates the delete confirmation state.
   *
   * @returns void
   */
  onDeleteClick(): void {
    this.showDeleteConfirm = true;
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
    this.deleteTask.emit(this.task.id);
    this.showDeleteConfirm = false;
    this.closeDialog();
  }

  /**
   * Cancels the delete confirmation.
   *
   * @returns void
   */
  cancelDelete(): void {
    this.showDeleteConfirm = false;
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
    const el = this.dialog.nativeElement;
    el.classList.remove('opened');
    el.close();
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
    if (event.target === this.dialog.nativeElement) {
      this.closeDialog();
    }
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
    event.preventDefault();
    this.closeDialog();
  }

  /**
   * Retrieves the initials of an assignee by contact ID.
   *
   * @param id The contact identifier
   * @returns The initials of the assignee
   */
  getAssigneeInitials(id: string): string {
    const contact = this.contactService.contacts.find((c) => {
      return c.id === id;
    });

    return getTwoInitials(contact?.name || 'Unknown');
  }

  /**
   * Retrieves the full name of an assignee by contact ID.
   *
   * @param id The contact identifier
   * @returns The name of the assignee
   */
  getAssigneeName(id: string): string {
    const contact = this.contactService.contacts.find((c) => {
      return c.id === id;
    });

    return contact?.name || 'Unknown';
  }

  /**
   * Retrieves the display color of an assignee by contact ID.
   *
   * @param id The contact identifier
   * @returns The color assigned to the contact
   */
  getUserColor(id: string): string {
    const contact = this.contactService.contacts.find((c) => {
      return c.id === id;
    });

    return contact?.userColor || '#9327ff';
  }

  /**
   * Resolves the avatar image source for an assignee.
   *
   * @param id The contact identifier.
   * @returns Data URL or `null` when unavailable.
   */
  getAssigneeAvatarSrc(id: string): string | null {
    const contact = this.contactService.contacts.find((c) => c.id === id);
    return getContactAvatarSrc(contact);
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
    this.task.subtasks[index].done = !this.task.subtasks[index].done;
    this.taskService.updateSubtasks(this.task);
  }

  /**
   * Opens an attachment in a new browser tab.
   *
   * @param attachment Attachment metadata object.
   * @returns void
   */
  openAttachment(attachment: TaskAttachment): void {
    const legacyUrl = this.getLegacyAttachmentUrl(attachment);
    if (legacyUrl) {
      window.open(legacyUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    const blob = this.getAttachmentBlob(attachment);
    if (!blob) return;
    const objectUrl = URL.createObjectURL(blob);
    window.open(objectUrl, '_blank', 'noopener,noreferrer');
    setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
  }

  /**
   * Downloads an attachment file.
   *
   * @param attachment Attachment metadata object.
   * @param index Attachment index in the list.
   * @returns void
   */
  downloadAttachment(attachment: TaskAttachment, index: number): void {
    const legacyUrl = this.getLegacyAttachmentUrl(attachment);
    const fileName = this.getAttachmentFileName(attachment, index);

    if (legacyUrl) {
      const link = document.createElement('a');
      link.href = legacyUrl;
      link.download = fileName;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.click();
      return;
    }

    const blob = this.getAttachmentBlob(attachment);
    if (!blob) return;

    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(objectUrl);
  }

  /**
   * Resolves a safe display name for an attachment.
   *
   * @param attachment Attachment metadata object.
   * @param index Attachment index in the list.
   * @returns A displayable file name.
   */
  getAttachmentFileName(attachment: TaskAttachment, index: number): string {
    const customName = attachment.fileName?.trim();
    if (customName) return customName;
    const withLegacyName = attachment as TaskAttachment & { name?: string };
    const legacyName = withLegacyName.name?.trim();
    if (legacyName) return legacyName;
    return `attachment-${index + 1}`;
  }

  /**
   * Indicates whether an attachment can be rendered as image thumbnail.
   *
   * @param attachment Attachment metadata object.
   * @returns `true` for image attachments.
   */
  isImageAttachment(attachment: TaskAttachment): boolean {
    const mimeType = this.getAttachmentMimeType(attachment);
    if (mimeType.startsWith('image/')) return true;

    const fileName = this.getAttachmentFileName(attachment, 0).toLowerCase();
    if (/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/.test(fileName)) return true;

    const legacyUrl = this.getLegacyAttachmentUrl(attachment)?.toLowerCase() ?? '';
    return /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?|#|$)/.test(legacyUrl);
  }

  /**
   * Returns a previewable image source for thumbnails.
   *
   * @param attachment Attachment metadata object.
   * @returns Image source URL or empty string when unavailable.
   */
  getAttachmentPreviewSrc(attachment: TaskAttachment): string {
    const legacyUrl = this.getLegacyAttachmentUrl(attachment);
    if (legacyUrl && this.isImageAttachment(attachment)) return legacyUrl;

    const rawBase64 = attachment.base64?.trim();
    if (!rawBase64) return '';
    if (rawBase64.startsWith('data:')) return rawBase64;

    const mimeType = this.getAttachmentMimeType(attachment);
    return `data:${mimeType};base64,${rawBase64}`;
  }

  /**
   * Converts base64 attachment data to a Blob.
   *
   * @param attachment Attachment metadata object.
   * @returns Blob instance or `null` if conversion fails.
   */
  private getAttachmentBlob(attachment: TaskAttachment): Blob | null {
    try {
      const rawBase64 = attachment.base64?.trim();
      if (!rawBase64) return null;
      const base64 = rawBase64.startsWith('data:')
        ? this.extractBase64FromDataUrl(rawBase64)
        : rawBase64;
      const byteString = atob(base64);
      const byteArray = new Uint8Array(byteString.length);

      for (let i = 0; i < byteString.length; i += 1) {
        byteArray[i] = byteString.charCodeAt(i);
      }

      const mimeType = this.getAttachmentMimeType(attachment);
      return new Blob([byteArray], { type: mimeType });
    } catch {
      return null;
    }
  }

  /**
   * Resolves MIME type from current and legacy attachment fields.
   *
   * @param attachment Attachment metadata object.
   * @returns MIME type string.
   */
  private getAttachmentMimeType(attachment: TaskAttachment): string {
    if (attachment.fileType?.trim()) return attachment.fileType.trim();
    const withLegacyType = attachment as TaskAttachment & { type?: string };
    if (withLegacyType.type?.trim()) return withLegacyType.type.trim();
    return 'application/octet-stream';
  }

  /**
   * Supports older attachment documents that stored external URLs.
   *
   * @param attachment Attachment metadata object.
   * @returns A URL if available; otherwise `null`.
   */
  private getLegacyAttachmentUrl(attachment: TaskAttachment): string | null {
    const withLegacyUrl = attachment as TaskAttachment & { url?: string };
    if (!withLegacyUrl.url) return null;
    return withLegacyUrl.url;
  }

  /**
   * Extracts the base64 payload from a full data URL.
   *
   * @param dataUrl Source data URL.
   * @returns Pure base64 data.
   */
  private extractBase64FromDataUrl(dataUrl: string): string {
    const separatorIndex = dataUrl.indexOf(',');
    if (separatorIndex === -1) return dataUrl;
    return dataUrl.slice(separatorIndex + 1);
  }
}
