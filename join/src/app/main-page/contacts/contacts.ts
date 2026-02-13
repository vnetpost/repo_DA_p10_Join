import { Component, DoCheck, HostListener, inject, ViewChild } from '@angular/core';
import { ContactList } from './contact-list/contact-list';
import { ContactInfo } from './contact-info/contact-info';
import { ContactDialog } from './contact-dialog/contact-dialog';
import { FirebaseService } from '../../shared/services/firebase-service';
import { Contact } from '../../shared/interfaces/contact';
import { ContactFormData } from '../../shared/interfaces/contact-form-data';
import { capitalizeFullname, setUserColor } from '../../shared/utilities/utils';
import { AuthService } from '../../shared/services/auth-service';

@Component({
  selector: 'app-contacts',
  imports: [ContactList, ContactInfo, ContactDialog],
  templateUrl: './contacts.html',
  styleUrl: './contacts.scss',
})
/**
 * Container for the contacts page that coordinates list, detail, and dialog flows.
 */
export class Contacts implements DoCheck {
  firebaseService = inject(FirebaseService);
  authService = inject(AuthService);
  private readonly mobileMaxWidth = 768;
  private lastContactsVersion = 0;

  isMobile = false;
  isDetailOpen = false;
  activeContactID: string | null = null;
  activeContact: Contact | null = null;
  toastVisible = false;

  @ViewChild(ContactDialog)
  dialog!: ContactDialog;

  constructor() {
    this.updateIsMobile();
  }

  ngDoCheck(): void {
    if (this.lastContactsVersion === this.firebaseService.contactsVersion) return;
    this.lastContactsVersion = this.firebaseService.contactsVersion;
    if (!this.activeContactID) return;
    const updatedContact = this.firebaseService.contacts.find(
      (contact) => contact.id === this.activeContactID,
    );
    if (!updatedContact) return;
    this.activeContact = updatedContact;
  }

  @HostListener('window:resize')
  /**
   * Updates the responsive state when the viewport changes.
   */
  onResize(): void {
    this.updateIsMobile();
  }

  /**
   * Sets the mobile flag based on the current viewport width.
   */
  private updateIsMobile(): void {
    this.isMobile = window.innerWidth <= this.mobileMaxWidth;
  }

  /**
   * Sets the active contact and opens the detail pane.
   */
  setActiveContact(selection: { id: string; contact: Contact }): void {
    this.activeContactID = selection.id;
    this.activeContact = selection.contact;
    this.isDetailOpen = true;
  }

  /**
   * Closes the contact detail view.
   */
  closeContactInfo(): void {
    this.isDetailOpen = false;
  }

  @HostListener('contextmenu', ['$event'])
  /**
   * Prevents the default context menu on the contacts page.
   */
  onContextMenu(event: Event): void {
    event.preventDefault();
  }

  /**
   * Opens the add-contact dialog.
   */
  openAddDialog(): void {
    this.dialog.openAddDialog();
  }

  /**
   * Opens the edit dialog for the provided contact.
   */
  openEditDialog(contact: Contact): void {
    this.activeContact = contact;
    this.dialog.openEditDialog(contact);
  }

  /**
   * Saves the dialog form by creating or updating a contact.
   */
  async onSave(formData: ContactFormData) {
    if (this.dialog.dialogMode === 'add') {
      await this.createContactFromForm(formData);
    } else {
      this.updateContactFromForm(formData);
    }
  }

  /**
   * Creates a new contact from form data and sets it as active.
   */
  async createContactFromForm(data: ContactFormData) {
    const contact: Contact = {
      name: capitalizeFullname(data.name),
      email: data.email,
      phone: data.phone,
      isAvailable: true,
      userColor: setUserColor(),
    };

    const newContactId = await this.firebaseService.addDocument(contact);
    this.showToast();

    if (!newContactId) return;

    const createdContact: Contact = {
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      isAvailable: contact.isAvailable,
      userColor: contact.userColor,
      id: newContactId,
    };

    this.activeContactID = newContactId;
    this.activeContact = createdContact;
    if (this.isMobile) {
      this.isDetailOpen = true;
    }
  }

  /**
   * Updates the active contact with data from the form.
   */
  updateContactFromForm(data: ContactFormData): void {
    if (!this.activeContact) return;

    const contact: Contact = {
      id: this.activeContact.id,
      name: capitalizeFullname(data.name),
      email: data.email,
      phone: data.phone,
      isAvailable: this.activeContact.isAvailable,
      userColor: this.activeContact.userColor,
    };

    this.firebaseService.updateDocument(contact, 'contacts');
    this.activeContact = contact;
    this.activeContactID = contact.id ?? null;
  }

  /**
   * Deletes a contact and clears the active selection.
   */
  onDelete(contact: Contact): void {
    if (!this.canDeleteContact(contact)) return;
    if (!contact.id) return;
    this.firebaseService.deleteDocument('contacts', contact.id);
    this.activeContact = null;
    this.activeContactID = null;
    this.isDetailOpen = false;
  }

  /**
   * Returns true when the selected contact is not the logged-in user.
   */
  canDeleteContact(contact: Contact | null): boolean {
    if (!contact) return false;
    const currentUserEmail = this.normalizeEmail(this.authService.firebaseAuth.currentUser?.email);
    const contactEmail = this.normalizeEmail(contact.email);
    if (!currentUserEmail) return true;
    return currentUserEmail !== contactEmail;
  }

  /**
   * Normalizes email values for a case-insensitive comparison.
   */
  private normalizeEmail(email: string | null | undefined): string {
    return String(email ?? '')
      .trim()
      .toLowerCase();
  }

  /**
   * Shows a short-lived toast for user feedback.
   */
  showToast(): void {
    this.toastVisible = true;

    setTimeout(() => {
      this.toastVisible = false;
    }, 1200);
  }
}
