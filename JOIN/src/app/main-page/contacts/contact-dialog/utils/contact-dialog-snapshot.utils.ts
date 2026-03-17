import { ContactAvatar } from '../../../../shared/interfaces/contact';
import { ContactFormData } from '../../../../shared/interfaces/contact-form-data';

/**
 * Normalized snapshot used to compare contact dialog changes.
 */
export type ContactDialogSnapshot = {
  name: string;
  email: string;
  phone: string;
  avatarSignature: string;
};

/**
 * Captures the current contact dialog values for change comparison.
 *
 * @param contactData Current contact form data.
 * @param avatar Current avatar payload.
 * @returns Normalized snapshot of the current dialog state.
 */
export function captureContactDialogSnapshot(
  contactData: ContactFormData,
  avatar: ContactAvatar | null
): ContactDialogSnapshot {
  return {
    name: contactData.name.trim(),
    email: contactData.email.trim(),
    phone: contactData.phone.trim(),
    avatarSignature: buildAvatarSignature(avatar),
  };
}

/**
 * Checks whether the current dialog state differs from its initial snapshot.
 *
 * @param initialSnapshot Snapshot captured when the dialog was opened.
 * @param contactData Current contact form data.
 * @param avatar Current avatar payload.
 * @returns `true` when unsaved changes are present.
 */
export function hasContactDialogChanges(
  initialSnapshot: ContactDialogSnapshot,
  contactData: ContactFormData,
  avatar: ContactAvatar | null
): boolean {
  const currentSnapshot = captureContactDialogSnapshot(contactData, avatar);

  return (
    currentSnapshot.name !== initialSnapshot.name ||
    currentSnapshot.email !== initialSnapshot.email ||
    currentSnapshot.phone !== initialSnapshot.phone ||
    currentSnapshot.avatarSignature !== initialSnapshot.avatarSignature
  );
}

/**
 * Creates a stable avatar comparison signature from the relevant payload fields.
 *
 * @param avatar Avatar payload to compare.
 * @returns String signature that can be used for change detection.
 */
function buildAvatarSignature(avatar: ContactAvatar | null): string {
  if (!avatar) return '';

  return [
    avatar.fileName?.trim() ?? '',
    avatar.fileType?.trim() ?? '',
    String(avatar.base64Size ?? ''),
    avatar.base64?.trim() ?? '',
  ].join('|');
}
