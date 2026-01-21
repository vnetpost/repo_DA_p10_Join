import { Component, inject } from '@angular/core';
import { SingleContact } from './single-contact/single-contact';
import { FirebaseService } from '../../shared/services/firebase-service';
import { Contact } from '../../shared/interfaces/contact';

@Component({
  selector: 'app-contact-list',
  imports: [SingleContact],
  templateUrl: './contact-list.html',
  styleUrl: './contact-list.scss',
})
export class ContactList {
  firebaseService = inject(FirebaseService);

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
}
