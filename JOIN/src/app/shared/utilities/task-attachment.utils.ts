import { TaskAttachment } from '../interfaces/task';

/**
 * Resolves a safe display name for one task attachment.
 *
 * @param attachment Attachment metadata object.
 * @param index Attachment index used as fallback.
 * @returns A displayable file name.
 */
export function getTaskAttachmentFileName(attachment: TaskAttachment, index: number): string {
  const customName = attachment.fileName?.trim();
  if (customName) return customName;

  const withLegacyName = attachment as TaskAttachment & { name?: string };
  const legacyName = withLegacyName.name?.trim();
  if (legacyName) return legacyName;

  return `attachment-${index + 1}`;
}

/**
 * Indicates whether the provided attachment can be previewed as an image.
 *
 * @param attachment Attachment metadata object.
 * @returns `true` when the attachment looks like an image.
 */
export function isTaskAttachmentImage(attachment: TaskAttachment): boolean {
  const mimeType = getTaskAttachmentMimeType(attachment);
  if (mimeType.startsWith('image/')) return true;

  const fileName = getTaskAttachmentFileName(attachment, 0).toLowerCase();
  if (/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/.test(fileName)) return true;

  const legacyUrl = getTaskAttachmentLegacyUrl(attachment)?.toLowerCase() ?? '';
  return /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?|#|$)/.test(legacyUrl);
}

/**
 * Builds a previewable image source for task attachment thumbnails.
 *
 * @param attachment Attachment metadata object.
 * @returns Image source URL or empty string when unavailable.
 */
export function getTaskAttachmentPreviewSrc(attachment: TaskAttachment): string {
  const legacyUrl = getTaskAttachmentLegacyUrl(attachment);
  if (legacyUrl && isTaskAttachmentImage(attachment)) return legacyUrl;

  const rawBase64 = attachment.base64?.trim();
  if (!rawBase64) return '';
  if (rawBase64.startsWith('data:')) return rawBase64;

  const mimeType = getTaskAttachmentMimeType(attachment);
  return `data:${mimeType};base64,${rawBase64}`;
}

/**
 * Converts base64 task attachment data into a Blob.
 *
 * @param attachment Attachment metadata object.
 * @returns Blob instance or `null` if conversion fails.
 */
export function getTaskAttachmentBlob(attachment: TaskAttachment): Blob | null {
  try {
    const rawBase64 = attachment.base64?.trim();
    if (!rawBase64) return null;

    const base64 = rawBase64.startsWith('data:')
      ? extractBase64FromDataUrl(rawBase64)
      : rawBase64;

    const byteString = atob(base64);
    const byteArray = new Uint8Array(byteString.length);

    for (let i = 0; i < byteString.length; i += 1) {
      byteArray[i] = byteString.charCodeAt(i);
    }

    const mimeType = getTaskAttachmentMimeType(attachment);
    return new Blob([byteArray], { type: mimeType });
  } catch {
    return null;
  }
}

/**
 * Returns the legacy URL field for older task attachments.
 *
 * @param attachment Attachment metadata object.
 * @returns Legacy URL if available; otherwise `null`.
 */
export function getTaskAttachmentLegacyUrl(attachment: TaskAttachment): string | null {
  const withLegacyUrl = attachment as TaskAttachment & { url?: string };
  if (!withLegacyUrl.url) return null;
  return withLegacyUrl.url;
}

/**
 * Resolves the best available MIME type for a task attachment.
 *
 * @param attachment Attachment metadata object.
 * @returns MIME type string.
 */
function getTaskAttachmentMimeType(attachment: TaskAttachment): string {
  if (attachment.fileType?.trim()) return attachment.fileType.trim();

  const withLegacyType = attachment as TaskAttachment & { type?: string };
  if (withLegacyType.type?.trim()) return withLegacyType.type.trim();

  return 'application/octet-stream';
}

/**
 * Extracts the raw base64 payload from a data URL string.
 *
 * @param dataUrl Full data URL.
 * @returns Base64 payload without the metadata prefix.
 */
function extractBase64FromDataUrl(dataUrl: string): string {
  const separatorIndex = dataUrl.indexOf(',');
  if (separatorIndex === -1) return dataUrl;
  return dataUrl.slice(separatorIndex + 1);
}
