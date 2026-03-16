import type Viewer from 'viewerjs';
import { TaskAttachmentViewerService } from '../../../shared/services/task-attachment-viewer.service';

/**
 * Encapsulates Viewer.js lifecycle management for the attachment upload gallery.
 */
export class AttachmentUploadViewer {
  private attachmentViewer: Viewer | null = null;

  constructor(private readonly attachmentViewerService: TaskAttachmentViewerService) {}

  /**
   * Opens the viewer for the gallery image at the requested index.
   *
   * @param galleryElement Hidden gallery element used by Viewer.js.
   * @param index Attachment index that should be shown first.
   * @returns void
   */
  open(galleryElement: HTMLElement | null | undefined, index: number): void {
    if (!galleryElement) return;
    this.destroy();
    this.attachmentViewer = this.attachmentViewerService.createViewer(galleryElement);
    this.attachmentViewer?.view(index);
  }

  /**
   * Destroys the current Viewer.js instance.
   *
   * @returns void
   */
  destroy(): void {
    this.attachmentViewer = this.attachmentViewerService.destroyViewer(this.attachmentViewer);
  }
}
