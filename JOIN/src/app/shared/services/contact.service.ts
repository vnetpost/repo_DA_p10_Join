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

  /**
   * Exposes the latest contact list from the Firebase facade.
   *
   * @returns The currently cached contacts.
   */
  get contacts(): Contact[] {
    return this.firebaseService.contacts;
  }

  /**
   * Exposes the contact collection version used for change detection.
   *
   * @returns The current contacts version counter.
   */
  get contactsVersion(): number {
    return this.firebaseService.contactsVersion;
  }

  /**
   * Indicates whether contact data is currently loading.
   *
   * @returns `true` while the backing Firebase data is loading.
   */
  get loading(): boolean {
    return this.firebaseService.loading;
  }

  /**
   * Finds a contact by its identifier.
   *
   * @param id The contact id to resolve.
   * @returns The matching contact or `null` when no match exists.
   */
  findContactById(id: string | null | undefined): Contact | null {
    if (!id) return null;
    return this.contacts.find((contact) => contact.id === id) ?? null;
  }

  /**
   * Persists a new contact document.
   *
   * @param contact The contact to create.
   * @returns The created document id or `null` when persistence fails.
   */
  async addContact(contact: Contact): Promise<string | null> {
    return this.firebaseService.addDocument(contact);
  }

  /**
   * Builds and persists a contact from dialog form data.
   *
   * @param data The submitted contact form data.
   * @returns The created contact including its generated id, or `null` on failure.
   */
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

  /**
   * Builds and persists an updated contact from dialog form data.
   *
   * @param activeContact The currently edited contact.
   * @param data The submitted form data.
   * @returns The updated contact snapshot.
   */
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

  /**
   * Persists an already prepared contact object.
   *
   * @param contact The contact to update.
   * @returns A promise that resolves when the update is complete.
   */
  async updateContact(contact: Contact): Promise<void> {
    await this.firebaseService.updateDocument(contact, 'contacts');
  }

  /**
   * Deletes a contact document.
   *
   * @param contactId The id of the contact to remove.
   * @returns A promise that resolves when deletion is complete.
   */
  async deleteContact(contactId: string): Promise<void> {
    await this.firebaseService.deleteDocument('contacts', contactId);
  }

  /**
   * Determines whether the active user may delete the given contact.
   *
   * @param contact The contact being considered for deletion.
   * @param currentUserEmail The authenticated user's email address.
   * @returns `true` when deletion is allowed.
   */
  canDeleteContact(contact: Contact | null, currentUserEmail?: string | null): boolean {
    if (!contact) return false;

    const normalizedCurrentUserEmail = this.normalizeEmail(currentUserEmail);
    const normalizedContactEmail = this.normalizeEmail(contact.email);

    if (!normalizedCurrentUserEmail) return true;
    return normalizedCurrentUserEmail !== normalizedContactEmail;
  }

  /**
   * Determines whether avatar editing should be enabled.
   *
   * @param contact The contact being edited.
   * @param isAuthenticated Indicates whether the current session is authenticated.
   * @returns `true` when avatar editing should be available.
   */
  canEditAvatar(contact: Contact | null, isAuthenticated: boolean): boolean {
    if (!contact) return false;
    return isAuthenticated;
  }

  /**
   * Normalizes an email address for case-insensitive comparisons.
   *
   * @param email The email address to normalize.
   * @returns The trimmed, lowercase email value.
   */
  private normalizeEmail(email: string | null | undefined): string {
    return String(email ?? '').trim().toLowerCase();
  }
}
