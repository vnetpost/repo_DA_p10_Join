import { Injectable } from '@angular/core';
import { TaskAttachment } from '../interfaces/task';
import { getTaskAttachmentBlob, getTaskAttachmentLegacyUrl } from '../utilities/task-attachment.utils';

/**
 * Handles browser file actions for persisted task attachments.
 */
@Injectable({
  providedIn: 'root',
})
export class TaskAttachmentActionService {
  /**
   * Opens the provided attachment in a new browser tab.
   *
   * @param attachment Attachment metadata object.
   * @returns void
   */
  openAttachment(attachment: TaskAttachment): void {
    const legacyUrl = getTaskAttachmentLegacyUrl(attachment);
    if (legacyUrl) {
      window.open(legacyUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    const blob = getTaskAttachmentBlob(attachment);
    if (!blob) return;

    const objectUrl = URL.createObjectURL(blob);
    window.open(objectUrl, '_blank', 'noopener,noreferrer');
    setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
  }

  /**
   * Downloads the provided attachment with the given file name.
   *
   * @param attachment Attachment metadata object.
   * @param fileName Name that should be used for the downloaded file.
   * @returns void
   */
  downloadAttachment(attachment: TaskAttachment, fileName: string): void {
    const legacyUrl = getTaskAttachmentLegacyUrl(attachment);
    if (legacyUrl) {
      const link = document.createElement('a');
      link.href = legacyUrl;
      link.download = fileName;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.click();
      return;
    }

    const blob = getTaskAttachmentBlob(attachment);
    if (!blob) return;

    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(objectUrl);
  }
}
