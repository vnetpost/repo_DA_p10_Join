import { Timestamp } from '@angular/fire/firestore';

/**
 * Contact entity stored in Firestore and used across the app UI.
 */
export interface Contact {
  id?: string;
  name: string;
  email: string;
  phone: number | string;
  isAvailable: boolean;
  userColor?: string | null;
  avatar?: ContactAvatar | null;
}

/**
 * Serialized avatar payload stored directly on a contact document.
 */
export interface ContactAvatar {
  fileName: string;
  fileType: string;
  base64Size: number;
  base64: string;
  uploadedAt: Timestamp;
}
