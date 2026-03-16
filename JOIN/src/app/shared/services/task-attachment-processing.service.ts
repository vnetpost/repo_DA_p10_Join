import { Injectable } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { TaskAttachment } from '../interfaces/task';
import { ImageProcessingService } from './image-processing.service';

/**
 * Converts selected files into persisted task attachment payloads.
 */
@Injectable({
  providedIn: 'root',
})
export class TaskAttachmentProcessingService {
  constructor(private imageProcessingService: ImageProcessingService) {}

  /**
   * Combines existing attachments with newly selected files.
   *
   * Files that cannot be processed are skipped and reported through the
   * returned warning message so task saving can continue.
   *
   * @param existingAttachments Attachments already stored on the task.
   * @param selectedAttachments Newly selected files from the form.
   * @returns Persistable attachments and an optional warning message.
   */
  async resolveAttachmentsForSave(
    existingAttachments: TaskAttachment[],
    selectedAttachments: File[]
  ): Promise<{
    attachments: TaskAttachment[];
    warningMessage: string;
  }> {
    const persistedExistingAttachments = [...existingAttachments];
    if (!selectedAttachments.length) return this.buildResolveResult(persistedExistingAttachments, [], 0);
    const processedFiles = await this.processSelectedFiles(selectedAttachments);
    return this.buildResolveResult(persistedExistingAttachments, processedFiles.attachments, processedFiles.failedCount);
  }

  /**
   * Estimates the persisted base64 payload size for the provided task attachments.
   *
   * @param existingAttachments Attachments already stored on the task.
   * @param selectedAttachments Newly selected files from the form.
   * @returns Combined persisted payload size in bytes-like base64 characters.
   */
  async estimatePersistedAttachmentBytes(
    existingAttachments: TaskAttachment[],
    selectedAttachments: File[]
  ): Promise<number> {
    const existingAttachmentBytes = this.sumAttachmentBytes(existingAttachments);
    if (!selectedAttachments.length) return existingAttachmentBytes;
    const newAttachmentBytes = await this.estimateNewAttachmentBytes(selectedAttachments);
    return existingAttachmentBytes + newAttachmentBytes;
  }

  /**
   * Converts a selected file into a serializable task attachment payload.
   *
   * @param file File selected by the user.
   * @returns Persistable attachment or `null` when processing fails.
   */
  private async createAttachmentFromFile(file: File): Promise<TaskAttachment | null> {
    try {
      const base64DataUrl = await this.readProcessedImage(file);
      if (!base64DataUrl) return null;
      return this.buildAttachmentPayload(file, base64DataUrl);
    } catch (error) {
      console.error('Attachment processing failed:', error);
      return null;
    }
  }

  /**
   * Processes all newly selected files into persisted attachments.
   *
   * @param selectedAttachments Newly selected files from the form.
   * @returns Created attachments and processing error count.
   */
  private async processSelectedFiles(selectedAttachments: File[]) {
    const attachments: TaskAttachment[] = [];
    let failedCount = 0;

    for (const selectedFile of selectedAttachments) {
      const createdAttachment = await this.createAttachmentFromFile(selectedFile);
      if (createdAttachment) attachments.push(createdAttachment);
      else failedCount += 1;
    }

    return { attachments, failedCount };
  }

  /**
   * Builds the final attachment result returned to the caller.
   *
   * @param existingAttachments Attachments already stored on the task.
   * @param newAttachments Newly processed attachments.
   * @param failedAttachments Number of files that could not be processed.
   * @returns Combined attachments plus warning message.
   */
  private buildResolveResult(
    existingAttachments: TaskAttachment[],
    newAttachments: TaskAttachment[],
    failedAttachments: number
  ) {
    return {
      attachments: [...existingAttachments, ...newAttachments],
      warningMessage: this.buildProcessingWarningMessage(failedAttachments),
    };
  }

  /**
   * Builds the warning text for skipped attachments.
   *
   * @param failedAttachments Number of failed file conversions.
   * @returns Warning message or an empty string.
   */
  private buildProcessingWarningMessage(failedAttachments: number): string {
    if (!failedAttachments) return '';
    const pluralSuffix = failedAttachments > 1 ? 's were' : ' was';
    return `${failedAttachments} attachment${pluralSuffix} skipped because processing failed.`;
  }

  /**
   * Sums the stored size metadata of persisted attachments.
   *
   * @param attachments Persisted task attachments.
   * @returns Total stored payload size.
   */
  private sumAttachmentBytes(attachments: TaskAttachment[]): number {
    return attachments.reduce((total, attachment) => total + attachment.base64Size, 0);
  }

  /**
   * Estimates the stored payload size of newly selected files.
   *
   * @param selectedAttachments Newly selected files.
   * @returns Total stored payload size for the new files.
   */
  private async estimateNewAttachmentBytes(selectedAttachments: File[]): Promise<number> {
    let totalAttachmentBytes = 0;

    for (const selectedFile of selectedAttachments) {
      const createdAttachment = await this.createAttachmentFromFile(selectedFile);
      totalAttachmentBytes += createdAttachment?.base64Size ?? 0;
    }

    return totalAttachmentBytes;
  }

  /**
   * Reads the processed image data URL, preferring the compressed variant.
   *
   * @param file Selected browser file.
   * @returns Processed data URL or `null`.
   */
  private async readProcessedImage(file: File): Promise<string | null> {
    return this.imageProcessingService.readProcessedImage(file);
  }

  /**
   * Builds the final persisted attachment payload from one processed image.
   *
   * @param file Original browser file.
   * @param base64DataUrl Processed image data URL.
   * @returns Serialized task attachment.
   */
  private buildAttachmentPayload(file: File, base64DataUrl: string): TaskAttachment {
    const fileType = this.resolveAttachmentMimeType(file, base64DataUrl);
    const base64 = this.extractBase64Value(base64DataUrl);
    const fileName = this.buildFileNameForMimeType(file.name, fileType);
    return { fileName, fileType, base64Size: base64.length, base64, uploadedAt: Timestamp.now() };
  }

  /**
   * Resolves the persisted MIME type of one processed image.
   *
   * @param file Original browser file.
   * @param base64DataUrl Processed image data URL.
   * @returns Persisted MIME type string.
   */
  private resolveAttachmentMimeType(file: File, base64DataUrl: string): string {
    return this.extractMimeTypeFromDataUrl(base64DataUrl) || file.type || 'image/jpeg';
  }

  /**
   * Extracts the pure base64 value from a data URL.
   *
   * @param dataUrl Data URL returned by `FileReader`.
   * @returns Base64 payload without mime prefix.
   */
  private extractBase64Value(dataUrl: string): string {
    const separatorIndex = dataUrl.indexOf(',');
    if (separatorIndex === -1) return dataUrl;
    return dataUrl.slice(separatorIndex + 1);
  }

  /**
   * Extracts the mime type from a data URL.
   *
   * @param dataUrl Data URL source string.
   * @returns Mime type or an empty string.
   */
  private extractMimeTypeFromDataUrl(dataUrl: string): string {
    const mimeMatch = dataUrl.match(/^data:([^;]+);base64,/i);
    return mimeMatch?.[1] ?? '';
  }

  /**
   * Adapts filename extension to the resulting mime type.
   *
   * @param fileName Original file name.
   * @param mimeType Mime type of the converted file.
   * @returns File name with matching extension.
   */
  private buildFileNameForMimeType(fileName: string, mimeType: string): string {
    const lastDotIndex = fileName.lastIndexOf('.');
    const baseName = lastDotIndex === -1 ? fileName : fileName.slice(0, lastDotIndex);

    if (mimeType === 'image/jpeg') return `${baseName}.jpg`;
    if (mimeType === 'image/png') return `${baseName}.png`;
    return fileName;
  }
}
