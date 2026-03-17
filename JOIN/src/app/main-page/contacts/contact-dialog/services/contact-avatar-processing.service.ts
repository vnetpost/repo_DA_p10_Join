import { Injectable } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { ContactAvatar } from '../../../../shared/interfaces/contact';
import { ImageProcessingService } from '../../../../shared/services/image-processing.service';

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

  constructor(private imageProcessingService: ImageProcessingService) {}

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
    const dataUrl = await this.imageProcessingService.readProcessedImage(file);
    if (!dataUrl) return null;
    return this.buildProcessedAvatar(file, dataUrl);
  }

  /**
   * Builds the processed avatar payload from one data URL.
   *
   * @param file Original browser file.
   * @param dataUrl Processed image data URL.
   * @returns Processed avatar payload or `null`.
   */
  private buildProcessedAvatar(file: File, dataUrl: string): ProcessedContactAvatar | null {
    const base64 = this.extractBase64FromDataUrl(dataUrl);
    if (!base64) return null;
    const fileType = this.resolveAvatarMimeType(file, dataUrl);
    const fileName = this.buildAvatarFileName(file, fileType);
    return {
      avatar: this.buildAvatarPayload(fileName, fileType, base64),
      previewSrc: `data:${fileType};base64,${base64}`,
    };
  }

  /**
   * Resolves the persisted MIME type for one processed avatar.
   *
   * @param file Original browser file.
   * @param dataUrl Processed image data URL.
   * @returns Persisted MIME type.
   */
  private resolveAvatarMimeType(file: File, dataUrl: string): string {
    return this.extractMimeTypeFromDataUrl(dataUrl) || file.type || 'image/jpeg';
  }

  /**
   * Builds the persisted file name for one processed avatar.
   *
   * @param file Original browser file.
   * @param fileType Persisted avatar MIME type.
   * @returns File name with matching extension.
   */
  private buildAvatarFileName(file: File, fileType: string): string {
    return this.buildFileNameForMimeType(file.name || 'avatar.jpg', fileType);
  }

  /**
   * Builds the final persisted avatar payload.
   *
   * @param fileName Persisted file name.
   * @param fileType Persisted avatar MIME type.
   * @param base64 Raw avatar data.
   * @returns Serialized avatar payload.
   */
  private buildAvatarPayload(fileName: string, fileType: string, base64: string): ContactAvatar {
    return {
      fileName,
      fileType,
      base64Size: base64.length,
      base64,
      uploadedAt: Timestamp.now(),
    };
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
