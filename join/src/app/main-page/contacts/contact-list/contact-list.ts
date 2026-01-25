import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SingleContact } from './single-contact/single-contact';
import { Contact } from '../../../shared/interfaces/contact';

@Component({
  selector: 'app-contact-list',
  imports: [SingleContact],
  templateUrl: './contact-list.html',
  styleUrl: './contact-list.scss',
})
export class ContactList {
  @Input() contacts: Contact[] = [];
  @Input() activeContactID: string | null = null;
  @Output() selected = new EventEmitter<{ contact: Contact; id: string }>();
  @Output() addContact = new EventEmitter<void>();

  getFirstLetter(contact: Contact): string {
    const name = contact?.name?.trim();
    if (!name) {
      return '#';
    }
    return name.charAt(0).toUpperCase();
  }

  isNewLetter(index: number): boolean {
    if (index === 0) return true;
    const contacts = this.contacts;
    return this.getFirstLetter(contacts[index]) !== this.getFirstLetter(contacts[index - 1]);
  }

  getContactId(contact: Contact, index: number): string {
    return contact.id ?? `${contact.name}-${index}`;
  }

  setActiveContact(contact: Contact, index: number): void {
    const id = this.getContactId(contact, index);
    this.selected.emit({ contact, id });
  }

  openContactDialog() {
    this.addContact.emit();
  }
}
