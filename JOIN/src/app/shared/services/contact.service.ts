import { Injectable, inject } from '@angular/core';
import { Contact } from '../interfaces/contact';
import { ContactFormData } from '../interfaces/contact-form-data';
import { capitalizeFullname, setUserColor } from '../utilities/utils';
import { FirebaseService } from './firebase.service';

/**
 * Contact-specific business logic and persistence facade.
 */
@Injectable({
  providedIn: 'root',
})
export class ContactService {
  private firebaseService = inject(FirebaseService);

  get contacts(): Contact[] {
    return this.firebaseService.contacts;
  }

  get contactsVersion(): number {
    return this.firebaseService.contactsVersion;
  }

  get loading(): boolean {
    return this.firebaseService.loading;
  }

  findContactById(id: string | null | undefined): Contact | null {
    if (!id) return null;
    return this.contacts.find((contact) => contact.id === id) ?? null;
  }

  async addContact(contact: Contact): Promise<string | null> {
    return this.firebaseService.addDocument(contact);
  }

  async createContactFromForm(data: ContactFormData): Promise<Contact | null> {
    const contact: Contact = {
      name: capitalizeFullname(data.name),
      email: data.email,
      phone: data.phone,
      isAvailable: true,
      userColor: setUserColor(),
      avatar: data.avatar ?? null,
    };

    const createdId = await this.addContact(contact);
    if (!createdId) return null;

    return {
      ...contact,
      id: createdId,
    };
  }

  async updateContactFromForm(activeContact: Contact, data: ContactFormData): Promise<Contact> {
    const contact: Contact = {
      id: activeContact.id,
      name: capitalizeFullname(data.name),
      email: data.email,
      phone: data.phone,
      isAvailable: activeContact.isAvailable,
      userColor: activeContact.userColor,
      avatar: data.avatar ?? activeContact.avatar ?? null,
    };

    await this.updateContact(contact);
    return contact;
  }

  async updateContact(contact: Contact): Promise<void> {
    await this.firebaseService.updateDocument(contact, 'contacts');
  }

  async deleteContact(contactId: string): Promise<void> {
    await this.firebaseService.deleteDocument('contacts', contactId);
  }

  canDeleteContact(contact: Contact | null, currentUserEmail?: string | null): boolean {
    if (!contact) return false;

    const normalizedCurrentUserEmail = this.normalizeEmail(currentUserEmail);
    const normalizedContactEmail = this.normalizeEmail(contact.email);

    if (!normalizedCurrentUserEmail) return true;
    return normalizedCurrentUserEmail !== normalizedContactEmail;
  }

  canEditAvatar(contact: Contact | null, isAuthenticated: boolean): boolean {
    if (!contact) return false;
    return isAuthenticated;
  }

  private normalizeEmail(email: string | null | undefined): string {
    return String(email ?? '').trim().toLowerCase();
  }
}
