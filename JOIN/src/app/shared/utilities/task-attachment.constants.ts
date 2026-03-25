/**
 * Maximum persisted base64 payload allowed for all images of one task combined.
 */
export const MAX_TASK_ATTACHMENT_BYTES = 1_000_000;

/**
 * MIME types supported by task attachments.
 */
export const TASK_ATTACHMENT_ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png'] as const;

/**
 * Error shown when the combined task image payload exceeds the database limit.
 */
export const TASK_ATTACHMENT_LIMIT_MESSAGE =
  'Images exceed 1 MB.';
