import { Injectable } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { ContactAvatar } from '../../../shared/interfaces/contact';

export type ProcessedContactAvatar = {
  avatar: ContactAvatar;
  previewSrc: string;
};

/**
 * Handles contact avatar validation, compression and payload creation.
 */
@Injectable({
  providedIn: 'root',
})
export class ContactAvatarProcessingService {
  readonly allowedMimeTypes = ['image/jpeg', 'image/png'];
  private readonly maxWidth = 800;
  private readonly maxHeight = 800;
  private readonly quality = 0.8;

  /**
   * Checks whether the selected avatar file type is supported.
   *
   * @param mimeType MIME type of the selected file.
   * @returns `true` when the file type is allowed.
   */
  isAllowedMimeType(mimeType: string): boolean {
    return this.allowedMimeTypes.includes(mimeType);
  }

  /**
   * Converts a selected file into a persisted contact avatar payload.
   *
   * @param file Selected avatar image file.
   * @returns Processed avatar payload and preview source or `null` when processing fails.
   */
  async processAvatar(file: File): Promise<ProcessedContactAvatar | null> {
    const outputMimeType = this.resolveOutputMimeType(file.type);
    const compressedDataUrl = await this.compressImage(file, outputMimeType);
    const fallbackDataUrl = compressedDataUrl ? null : await this.readFileAsDataUrl(file);
    const dataUrl = compressedDataUrl ?? fallbackDataUrl;
    if (!dataUrl) return null;

    const base64 = this.extractBase64FromDataUrl(dataUrl);
    if (!base64) return null;

    const fileType = this.extractMimeTypeFromDataUrl(dataUrl) || file.type || 'image/jpeg';
    const fileName = this.buildFileNameForMimeType(file.name || 'avatar.jpg', fileType);

    return {
      avatar: {
        fileName,
        fileType,
        base64Size: base64.length,
        base64,
        uploadedAt: Timestamp.now(),
      },
      previewSrc: `data:${fileType};base64,${base64}`,
    };
  }

  /**
   * Reads a file and returns a Base64 data URL.
   *
   * @param file Selected file.
   * @returns Promise resolving to data URL or `null`.
   */
  private readFileAsDataUrl(file: File): Promise<string | null> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Compresses an image file while keeping aspect ratio.
   *
   * @param file Selected image file.
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

          if (width > this.maxWidth || height > this.maxHeight) {
            if (width > height) {
              height = (height * this.maxWidth) / width;
              width = this.maxWidth;
            } else {
              width = (width * this.maxHeight) / height;
              height = this.maxHeight;
            }
          }

          canvas.width = Math.round(width);
          canvas.height = Math.round(height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          resolve(canvas.toDataURL(outputMimeType, this.quality));
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
   * Extracts MIME type from a data URL header.
   *
   * @param dataUrl Data URL string.
   * @returns MIME type or empty string.
   */
  private extractMimeTypeFromDataUrl(dataUrl: string): string {
    const mimeMatch = dataUrl.match(/^data:([^;]+);base64,/i);
    return mimeMatch?.[1]?.trim() || '';
  }

  /**
   * Extracts pure base64 payload from a data URL.
   *
   * @param dataUrl Data URL string.
   * @returns Raw base64 value.
   */
  private extractBase64FromDataUrl(dataUrl: string): string {
    const separatorIndex = dataUrl.indexOf(',');
    if (separatorIndex === -1) return dataUrl;
    return dataUrl.slice(separatorIndex + 1);
  }

  /**
   * Adapts filename extension to the resulting mime type.
   *
   * @param fileName Original file name.
   * @param mimeType Mime type of the processed avatar.
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
