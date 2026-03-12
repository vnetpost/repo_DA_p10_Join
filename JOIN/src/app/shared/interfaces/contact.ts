import { Timestamp } from '@angular/fire/firestore';

export interface Contact {
  id?: string;
  name: string;
  email: string;
  phone: number | string;
  isAvailable: boolean;
  userColor?: string | null;
  avatar?: ContactAvatar | null;
}

export interface ContactAvatar {
  fileName: string;
  fileType: string;
  base64Size: number;
  base64: string;
  uploadedAt: Timestamp;
}
