import { Component, HostListener, inject, ViewChild } from '@angular/core';
import { ContactList } from './contact-list/contact-list';
import { ContactInfo } from './contact-info/contact-info';
import { ContactDialog } from './contact-dialog/contact-dialog';
import { FirebaseService } from '../../shared/services/firebase-service';
import { Contact } from '../../shared/interfaces/contact';
import { ContactFormData } from '../../shared/interfaces/contact-form-data';
import { capitalizeFullname, setUserColor } from '../../shared/utilities/utils';

@Component({
  selector: 'app-contacts',
  imports: [ContactList, ContactInfo, ContactDialog],
  templateUrl: './contacts.html',
  styleUrl: './contacts.scss',
})
export class Contacts {
  firebaseService = inject(FirebaseService);
  private readonly mobileMaxWidth = 768;

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

  @HostListener('window:resize')
  onResize(): void {
    this.updateIsMobile();
  }

  private updateIsMobile(): void {
    this.isMobile = window.innerWidth <= this.mobileMaxWidth;
  }

  setActiveContact(selection: { id: string; contact: Contact }): void {
    this.activeContactID = selection.id;
    this.activeContact = selection.contact;
    this.isDetailOpen = true;
  }

  closeContactInfo(): void {
    this.isDetailOpen = false;
  }

  @HostListener('contextmenu', ['$event'])
  onContextMenu(event: Event): void {
    event.preventDefault();
  }

  openAddDialog(): void {
    this.dialog.openAddDialog();
  }

  openEditDialog(contact: Contact): void {
    this.activeContact = contact;
    this.dialog.openEditDialog(contact);
  }

  async onSave(formData: ContactFormData) {
    if (this.dialog.dialogMode === 'add') {
      await this.createContactFromForm(formData);
    } else {
      this.updateContactFromForm(formData);
    }
  }

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

  updateContactFromForm(data: ContactFormData): void {
    if (!this.activeContact) return;

    const contact: Contact = {
      id: this.activeContact.id,
      name: capitalizeFullname(data.name),
      email: data.email,
      phone: data.phone,
      isAvailable: this.activeContact.isAvailable,
      userColor: this.activeContact.userColor ?? null,
    };

    this.firebaseService.updateDocument(contact, 'contacts');
  }

  onDelete(contact: Contact): void {
    if (!contact.id) return;
    this.firebaseService.deleteDocument('contacts', contact.id);
    this.activeContact = null;
    this.activeContactID = null;
    this.isDetailOpen = false;
  }

  showToast(): void {
    this.toastVisible = true;

    setTimeout(() => {
      this.toastVisible = false;
    }, 1200);
  }
}
