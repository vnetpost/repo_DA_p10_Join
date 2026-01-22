import { Component, inject } from '@angular/core';
import { SingleContact } from './single-contact/single-contact';
import { FirebaseService } from '../../../shared/services/firebase-service';
import { Contact } from '../../../shared/interfaces/contact';

@Component({
  selector: 'app-contact-list',
  imports: [SingleContact],
  templateUrl: './contact-list.html',
  styleUrl: './contact-list.scss',
})
export class ContactList {
  firebaseService = inject(FirebaseService);
  activeContactID: string | number | null = null;

  getFirstLetter(contact: Contact): string {
    const name = contact?.name?.trim();
    if (!name) {
      return '#';
    }
    return name.charAt(0).toUpperCase();
  }

  isNewLetter(index: number): boolean {
    if (index === 0) return true;
    const contacts = this.firebaseService.contacts;
    return this.getFirstLetter(contacts[index]) !== this.getFirstLetter(contacts[index - 1]);
  }

  getContactId(contact: Contact, index: number): string | number {
    return contact.id ?? `${contact.name}-${index}`;
  }

  setActiveContact(contact: Contact, index: number): void {
    this.activeContactID = this.getContactId(contact, index);
  }

  openContactDialog() {}
}
