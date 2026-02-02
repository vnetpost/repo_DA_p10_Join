import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Contact } from '../../../shared/interfaces/contact';
import { FirebaseService } from '../../../shared/services/firebase-service';
import { getTwoInitials } from '../../../shared/utilities/utils';

@Component({
  selector: 'app-dropdown-assignee',
  imports: [],
  templateUrl: './dropdown-assignee.html',
  styleUrl: './dropdown-assignee.scss',
})
export class DropdownAssignee {
  firebaseService = inject(FirebaseService);
  getTwoInitials = getTwoInitials;

  @Input() selectedContacts: Contact[] = [];
  @Output() selectedContactsChange = new EventEmitter<Contact[]>();

  assignedDropdownOpen = false;
  assignedQuery = '';

  get assignedToLabel(): string {
    if (!this.selectedContacts.length) return '';
    return this.selectedContacts.map((contact) => contact.name).join(', ');
  }

  get filteredContacts(): Contact[] {
    const query = this.assignedQuery.trim().toLowerCase();
    if (!query) return this.firebaseService.contacts;
    return this.firebaseService.contacts.filter((contact) =>
      contact.name.toLowerCase().includes(query),
    );
  }

  toggleAssignedDropdown(): void {
    this.assignedDropdownOpen = !this.assignedDropdownOpen;
    if (!this.assignedDropdownOpen) {
      this.assignedQuery = '';
    }
  }

  toggleContact(contact: Contact, event?: Event): void {
    event?.stopPropagation();
    const index = this.selectedContacts.findIndex((item) => item.id === contact.id);
    if (index === -1) {
      this.selectedContacts = [...this.selectedContacts, contact];
      this.selectedContactsChange.emit(this.selectedContacts);
      return;
    }
    this.selectedContacts = this.selectedContacts.filter((item) => item.id !== contact.id);
    this.selectedContactsChange.emit(this.selectedContacts);
  }

  isSelected(contact: Contact): boolean {
    return this.selectedContacts.some((item) => item.id === contact.id);
  }

  getContactId(contact: Contact, index: number): string {
    return contact.id ?? `${contact.name}-${index}`;
  }
}
