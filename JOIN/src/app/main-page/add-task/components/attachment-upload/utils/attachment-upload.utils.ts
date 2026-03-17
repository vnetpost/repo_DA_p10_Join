import { formatAttachmentSize } from '../../../../../shared/utilities/task-attachment.utils';

/**
 * Builds a short type label for one selected browser file.
 *
 * @param file Selected browser file.
 * @returns File type label such as `JPEG` or `PNG`.
 */
export function getSelectedAttachmentTypeLabel(file: File): string {
  if (file.type === 'image/jpeg') return 'JPEG';
  if (file.type === 'image/png') return 'PNG';

  const mimeSubtype = file.type.split('/')[1]?.trim();
  if (mimeSubtype) return mimeSubtype.toUpperCase();
  return file.type.toUpperCase();
}

/**
 * Formats the raw size of one selected browser file.
 *
 * @param file Selected browser file.
 * @returns Human-readable file size label.
 */
export function getSelectedAttachmentSizeLabel(file: File): string {
  return formatAttachmentSize(file.size);
}
