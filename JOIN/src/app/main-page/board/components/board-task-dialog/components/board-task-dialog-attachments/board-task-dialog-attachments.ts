import { Component, ElementRef, Input, OnDestroy, ViewChild, inject } from '@angular/core';
import { TaskAttachment } from '../../../../../../shared/interfaces/task';
import {
  getTaskAttachmentFileName,
  getTaskAttachmentPreviewSrc,
  getTaskAttachmentSizeLabel,
  getTaskAttachmentTypeLabel,
  isTaskAttachmentImage,
} from '../../../../../../shared/utilities/task-attachment.utils';
import type Viewer from 'viewerjs';
import { TaskDialogAttachmentService } from '../../services/task-dialog-attachment.service';

/**
 * Renders task attachments including preview, download and Viewer.js support.
 */
@Component({
  selector: 'app-board-task-dialog-attachments',
  imports: [],
  templateUrl: './board-task-dialog-attachments.html',
  styleUrl: './board-task-dialog-attachments.scss',
})
export class BoardTaskDialogAttachments implements OnDestroy {
  @Input() attachments: TaskAttachment[] = [];

  @ViewChild('attachmentViewerGallery') attachmentViewerGallery?: ElementRef<HTMLElement>;

  readonly getAttachmentFileName = getTaskAttachmentFileName;
  readonly getAttachmentPreviewSrc = getTaskAttachmentPreviewSrc;
  readonly getAttachmentSizeLabel = getTaskAttachmentSizeLabel;
  readonly getAttachmentTypeLabel = getTaskAttachmentTypeLabel;
  readonly isImageAttachment = isTaskAttachmentImage;
  private readonly attachmentService = inject(TaskDialogAttachmentService);
  private attachmentViewer: Viewer | null = null;

  /**
   * Returns all attachments that can be displayed inside the image viewer.
   */
  get previewableAttachments(): TaskAttachment[] {
    return this.attachments.filter((attachment) => this.isImageAttachment(attachment));
  }

  /**
   * Destroys the image viewer instance on component teardown.
   *
   * @returns void
   */
  ngOnDestroy(): void {
    this.destroyAttachmentViewer();
  }

  /**
   * Opens an attachment in Viewer.js or in a new browser tab.
   *
   * @param attachment Attachment metadata object.
   * @returns void
   */
  openAttachment(attachment: TaskAttachment): void {
    this.attachmentViewer = this.attachmentService.openAttachment(
      attachment,
      this.previewableAttachments,
      this.attachmentViewer,
      this.attachmentViewerGallery?.nativeElement
    );
  }

  /**
   * Downloads an attachment file.
   *
   * @param attachment Attachment metadata object.
   * @param index Attachment index in the list.
   * @returns void
   */
  downloadAttachment(attachment: TaskAttachment, index: number): void {
    this.attachmentService.downloadAttachment(attachment, index);
  }

  /**
   * Destroys the current Viewer.js instance when it is no longer needed.
   *
   * @returns void
   */
  private destroyAttachmentViewer(): void {
    this.attachmentViewer = this.attachmentService.destroyViewer(this.attachmentViewer);
  }
}
