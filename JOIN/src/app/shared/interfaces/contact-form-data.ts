import { ContactAvatar } from './contact';

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  avatar?: ContactAvatar | null;
}
