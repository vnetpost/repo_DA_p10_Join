import { Component, inject } from '@angular/core';
import { ContactList } from './contact-list/contact-list';
import { ContactInfo } from './contact-info/contact-info';
import { ContactDialog } from './contact-dialog/contact-dialog';
import { FirebaseService } from '../../shared/services/firebase-service';
import { Contact } from '../../shared/interfaces/contact';

@Component({
  selector: 'app-contacts',
  imports: [ContactList, ContactInfo, ContactDialog],
  templateUrl: './contacts.html',
  styleUrl: './contacts.scss',
})
export class Contacts {
  firebaseService = inject(FirebaseService);
  activeContactID: string | number | null = null;
  activeContact: Contact | null = null;

  setActiveContact(selection: {  id: string | number; contact: Contact }): void {
    this.activeContactID = selection.id;
    this.activeContact = selection.contact;
  }

  openContactDialog(): void {}

}
