import { Component, HostListener, inject, ViewChild } from '@angular/core';
import { ContactList } from './contact-list/contact-list';
import { ContactInfo } from './contact-info/contact-info';
import { ContactDialog } from './contact-dialog/contact-dialog';
import { FirebaseService } from '../../shared/services/firebase-service';
import { Contact } from '../../shared/interfaces/contact';
import { ContactFormData } from '../../shared/interfaces/contact-form-data';
import { capitalizeFullname } from '../../shared/utilities/utils';

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

  onSave(formData: ContactFormData): void {
    if (this.dialog.dialogMode === 'add') {
      this.createContactFromForm(formData);
    } else {
      this.updateContactFromForm(formData);
    }
  }

  createContactFromForm(data: ContactFormData): void {
    const contact: Contact = {
      name: capitalizeFullname(data.name),
      email: data.email,
      phone: data.phone,
      isAvailable: true,
      userColor: null,
    };

    this.firebaseService.addDocument(contact);
    this.showToast();
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
  }

  showToast(): void {
    this.toastVisible = true;

    setTimeout(() => {
      this.toastVisible = false;
    }, 1200);
  }

}
