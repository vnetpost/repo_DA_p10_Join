import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  inject,
  ElementRef,
} from '@angular/core';
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
  elementRef = inject(ElementRef);
  firebaseService = inject(FirebaseService);

  getTwoInitials = getTwoInitials;

  @Input() selectedContacts: Contact[] = [];
  @Output() selectedContactsChange = new EventEmitter<Contact[]>();

  isDropdownOpen = false;
  assigneeQuery = '';

  get filteredContacts(): Contact[] {
    const query = this.assigneeQuery.trim().toLowerCase();
    if (!query) return this.firebaseService.contacts;
    return this.firebaseService.contacts.filter((contact) =>
      contact.name.toLowerCase().includes(query),
    );
  }

  toggleDropdownOpen(event?: Event): void {
    event?.stopPropagation();
    if (event && this.isDropdownOpen && event.target instanceof HTMLInputElement) return;
    this.isDropdownOpen = !this.isDropdownOpen;
    if (!this.isDropdownOpen) this.assigneeQuery = '';
  }

  @HostListener('document:pointerdown', ['$event'])
  closeOnOutsidePointerDown(event: Event): void {
    if (!this.isDropdownOpen) return;
    const target = event.target;
    if (target && this.elementRef.nativeElement.contains(target)) return;
    this.isDropdownOpen = false;
    this.assigneeQuery = '';
  }

  toggleContact(contact: Contact, event?: Event): void {
    event?.stopPropagation();
    const index = this.selectedContacts.findIndex((item) => item.id === contact.id);
    if (index === -1) {
      this.selectedContacts.push(contact);
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
