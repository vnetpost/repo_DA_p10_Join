import { Injectable, inject } from '@angular/core';
import { TaskAttachment } from '../../../../../shared/interfaces/task';
import { TaskAttachmentActionService } from '../../../../../shared/services/task-attachment-action.service';
import { TaskAttachmentViewerService } from '../../../../../shared/services/task-attachment-viewer.service';
import { getTaskAttachmentFileName } from '../../../../../shared/utilities/task-attachment.utils';
import type Viewer from 'viewerjs';

/**
 * Coordinates attachment preview, viewer lifecycle and download behavior for the task dialog.
 */
@Injectable({
  providedIn: 'root',
})
export class TaskDialogAttachmentService {
  private readonly attachmentViewerService = inject(TaskAttachmentViewerService);
  private readonly attachmentActionService = inject(TaskAttachmentActionService);

  /**
   * Opens an attachment either inside Viewer.js or in a new browser tab.
   *
   * @param attachment Requested attachment.
   * @param previewableAttachments Image attachments available for the viewer.
   * @param currentViewer Current viewer instance.
   * @param galleryElement Hidden gallery element.
   * @param dialogElement Native dialog hosting the viewer.
   * @returns Updated viewer instance.
   */
  openAttachment(
    attachment: TaskAttachment,
    previewableAttachments: TaskAttachment[],
    currentViewer: Viewer | null,
    galleryElement?: HTMLElement,
    dialogElement?: HTMLDialogElement
  ): Viewer | null {
    const viewerIndex = previewableAttachments.indexOf(attachment);
    if (viewerIndex === -1) {
      this.attachmentActionService.openAttachment(attachment);
      return currentViewer;
    }

    const nextViewer = this.initializeViewer(
      currentViewer,
      previewableAttachments,
      galleryElement,
      dialogElement
    );
    nextViewer?.view(viewerIndex);
    return nextViewer;
  }

  /**
   * Downloads an attachment with its derived file name.
   *
   * @param attachment Attachment metadata object.
   * @param index Attachment index in the list.
   * @returns void
   */
  downloadAttachment(attachment: TaskAttachment, index: number): void {
    const fileName = getTaskAttachmentFileName(attachment, index);
    this.attachmentActionService.downloadAttachment(attachment, fileName);
  }

  /**
   * Creates or recreates the Viewer.js instance for the current attachment gallery.
   *
   * @param currentViewer Existing viewer instance.
   * @param previewableAttachments Image attachments available for the viewer.
   * @param galleryElement Hidden gallery element.
   * @param dialogElement Native dialog hosting the viewer.
   * @returns Updated viewer instance.
   */
  initializeViewer(
    currentViewer: Viewer | null,
    previewableAttachments: TaskAttachment[],
    galleryElement?: HTMLElement,
    dialogElement?: HTMLDialogElement
  ): Viewer | null {
    if (!galleryElement || !previewableAttachments.length) {
      return this.destroyViewer(currentViewer);
    }

    const clearedViewer = this.destroyViewer(currentViewer);
    return this.attachmentViewerService.createViewer(galleryElement, dialogElement);
  }

  /**
   * Destroys the current Viewer.js instance when it is no longer needed.
   *
   * @param viewer Existing viewer instance.
   * @returns Cleared viewer reference.
   */
  destroyViewer(viewer: Viewer | null): null {
    return this.attachmentViewerService.destroyViewer(viewer);
  }
}
