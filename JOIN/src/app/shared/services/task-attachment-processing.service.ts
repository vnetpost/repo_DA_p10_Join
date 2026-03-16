import { Injectable } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { TaskAttachment } from '../interfaces/task';

/**
 * Converts selected files into persisted task attachment payloads.
 */
@Injectable({
  providedIn: 'root',
})
export class TaskAttachmentProcessingService {
  private readonly defaultMaxWidth = 800;
  private readonly defaultMaxHeight = 800;
  private readonly defaultQuality = 0.8;

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
    if (!selectedAttachments.length) {
      return {
        attachments: persistedExistingAttachments,
        warningMessage: '',
      };
    }

    const newAttachments: TaskAttachment[] = [];
    let failedAttachments = 0;

    for (const selectedFile of selectedAttachments) {
      const createdAttachment = await this.createAttachmentFromFile(selectedFile);
      if (createdAttachment) newAttachments.push(createdAttachment);
      else failedAttachments += 1;
    }

    if (failedAttachments > 0) {
      const pluralSuffix = failedAttachments > 1 ? 's were' : ' was';
      return {
        attachments: [...persistedExistingAttachments, ...newAttachments],
        warningMessage: `${failedAttachments} attachment${pluralSuffix} skipped because processing failed.`,
      };
    }

    return {
      attachments: [...persistedExistingAttachments, ...newAttachments],
      warningMessage: '',
    };
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
    const existingAttachmentBytes = existingAttachments.reduce((total, attachment) => {
      return total + attachment.base64Size;
    }, 0);
    if (!selectedAttachments.length) return existingAttachmentBytes;

    let totalAttachmentBytes = existingAttachmentBytes;

    for (const selectedFile of selectedAttachments) {
      const createdAttachment = await this.createAttachmentFromFile(selectedFile);
      if (!createdAttachment) continue;
      totalAttachmentBytes += createdAttachment.base64Size;
    }

    return totalAttachmentBytes;
  }

  /**
   * Converts a selected file into a serializable task attachment payload.
   *
   * @param file File selected by the user.
   * @returns Persistable attachment or `null` when processing fails.
   */
  private async createAttachmentFromFile(file: File): Promise<TaskAttachment | null> {
    try {
      const outputMimeType = this.resolveOutputMimeType(file.type);
      const compressedDataUrl = await this.compressImage(file, outputMimeType);
      const fallbackDataUrl = compressedDataUrl ? null : await this.readFileAsDataUrl(file);
      const base64DataUrl = compressedDataUrl ?? fallbackDataUrl;
      if (!base64DataUrl) return null;

      const fileType =
        this.extractMimeTypeFromDataUrl(base64DataUrl) || file.type || 'image/jpeg';
      const base64 = this.extractBase64Value(base64DataUrl);
      const fileName = this.buildFileNameForMimeType(file.name, fileType);

      return {
        fileName,
        fileType,
        base64Size: base64.length,
        base64,
        uploadedAt: Timestamp.now(),
      };
    } catch (error) {
      console.error('Attachment processing failed:', error);
      return null;
    }
  }

  /**
   * Reads a file as a data URL.
   *
   * @param file Source file from file input.
   * @returns Data URL or `null` when reading fails.
   */
  private readFileAsDataUrl(file: File): Promise<string | null> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        resolve(typeof result === 'string' ? result : null);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Compresses an image file while keeping aspect ratio.
   *
   * @param file Source image file.
   * @param outputMimeType Mime type used for the exported canvas image.
   * @returns Data URL or `null` when compression fails.
   */
  private compressImage(file: File, outputMimeType: string): Promise<string | null> {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result !== 'string') {
          resolve(null);
          return;
        }

        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(null);
            return;
          }

          let width = img.width;
          let height = img.height;

          if (width > this.defaultMaxWidth || height > this.defaultMaxHeight) {
            if (width > height) {
              height = (height * this.defaultMaxWidth) / width;
              width = this.defaultMaxWidth;
            } else {
              width = (width * this.defaultMaxHeight) / height;
              height = this.defaultMaxHeight;
            }
          }

          canvas.width = Math.round(width);
          canvas.height = Math.round(height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          resolve(canvas.toDataURL(outputMimeType, this.defaultQuality));
        };

        img.onerror = () => resolve(null);
        img.src = result;
      };

      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Resolves the exported mime type so supported image formats keep their original type.
   *
   * @param mimeType Original file mime type.
   * @returns Output mime type used for processing.
   */
  private resolveOutputMimeType(mimeType: string): string {
    return mimeType === 'image/png' ? 'image/png' : 'image/jpeg';
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
