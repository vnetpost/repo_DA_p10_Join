import { TaskAttachment } from '../../../shared/interfaces/task';
import { TaskAttachmentProcessingService } from '../../../shared/services/task-attachment-processing.service';

/**
 * Tracks persisted attachment payload usage for the current task form.
 */
export class AttachmentUploadUsage {
  currentAttachmentBytes = 0;
  private requestId = 0;

  constructor(
    private readonly taskAttachmentProcessingService: TaskAttachmentProcessingService,
    private readonly maxTaskAttachmentBytes: number,
  ) {}

  /**
   * Builds the human-readable usage label for the upload limit display.
   *
   * @returns Current used megabytes relative to the 1 MB limit.
   */
  get usageLabel(): string {
    const usedMegabytes = this.formatMegabytes(this.currentAttachmentBytes);
    const maxMegabytes = this.formatMegabytes(this.maxTaskAttachmentBytes);
    return `${usedMegabytes} / ${maxMegabytes} MB used`;
  }

  /**
   * Recalculates the persisted payload currently occupied by task images.
   *
   * @param existingAttachments Persisted attachments already linked to the task.
   * @param selectedFiles Newly selected files pending upload.
   * @returns Promise that resolves after the latest usage estimate has been applied.
   */
  async refresh(existingAttachments: TaskAttachment[], selectedFiles: File[]): Promise<void> {
    const requestId = ++this.requestId;
    const estimatedBytes =
      await this.taskAttachmentProcessingService.estimatePersistedAttachmentBytes(
        existingAttachments,
        selectedFiles,
      );

    if (requestId !== this.requestId) return;
    this.currentAttachmentBytes = estimatedBytes;
  }

  /**
   * Checks whether the provided selection would exceed the task upload limit.
   *
   * @param existingAttachments Persisted attachments already linked to the task.
   * @param selectedFiles Candidate selected files.
   * @returns `true` when the persisted payload would exceed the allowed limit.
   */
  async exceedsLimit(existingAttachments: TaskAttachment[], selectedFiles: File[]): Promise<boolean> {
    const totalAttachmentBytes =
      await this.taskAttachmentProcessingService.estimatePersistedAttachmentBytes(
        existingAttachments,
        selectedFiles,
      );
    return totalAttachmentBytes > this.maxTaskAttachmentBytes;
  }

  /**
   * Formats one byte count as a megabyte string for the upload limit display.
   *
   * @param bytes Persisted base64 payload size.
   * @returns Formatted megabyte string with two decimals.
   */
  private formatMegabytes(bytes: number): string {
    return (bytes / this.maxTaskAttachmentBytes).toFixed(2);
  }
}
