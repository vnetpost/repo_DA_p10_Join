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
import { ContactService } from '../../../shared/services/contact.service';
import {
  getContactDisplayAvatarSrc,
  getContactDisplayColor,
  getContactDisplayInitials,
} from '../../../shared/utilities/contact-presenter.utils';

/**
 * Searchable multi-select dropdown for choosing task assignees.
 */
@Component({
  selector: 'app-dropdown-assignee',
  imports: [],
  templateUrl: './dropdown-assignee.html',
  styleUrl: './dropdown-assignee.scss',
})
export class DropdownAssignee {
  private static nextDropdownId = 0;
  elementRef = inject(ElementRef);
  contactService = inject(ContactService);
  readonly assigneePreviewLimit = 5;
  readonly dropdownId = `task-assignee-dropdown-${DropdownAssignee.nextDropdownId++}`;

  readonly getContactDisplayInitials = getContactDisplayInitials;
  readonly getContactDisplayAvatarSrc = getContactDisplayAvatarSrc;
  readonly getContactDisplayColor = getContactDisplayColor;

  /** Currently selected contacts. */
  @Input() selectedContacts: Contact[] = [];
  /** Emits whenever the contact selection changes. */
  @Output() selectedContactsChange = new EventEmitter<Contact[]>();

  isDropdownOpen = false;
  assigneeQuery = '';

  /** Contacts filtered by the current search query. */
  get filteredContacts(): Contact[] {
    const query = this.assigneeQuery.trim().toLowerCase();
    if (!query) return this.contactService.contacts;
    return this.contactService.contacts.filter((contact) =>
      contact.name.toLowerCase().includes(query),
    );
  }

  /**
   * Contacts shown as visible bubbles in the collapsed preview.
   */
  get visibleSelectedContacts(): Contact[] {
    return this.selectedContacts.slice(0, this.assigneePreviewLimit);
  }

  /**
   * Number of selected contacts that remain hidden behind the counter bubble.
   */
  get hiddenSelectedContactsCount(): number {
    return Math.max(this.selectedContacts.length - this.assigneePreviewLimit, 0);
  }

  /**
   * Toggles dropdown visibility and resets search if it closes.
   * @param event Optional trigger event used to stop propagation.
   */
  toggleDropdownOpen(event?: Event): void {
    event?.stopPropagation();
    if (event && this.isDropdownOpen && event.target instanceof HTMLInputElement) return;
    this.isDropdownOpen = !this.isDropdownOpen;
    if (!this.isDropdownOpen) this.assigneeQuery = '';
  }

  /**
   * Closes the dropdown when the pointer interaction happens outside this component.
   * @param event Pointer-down event from the document.
   */
  @HostListener('document:pointerdown', ['$event'])
  closeOnOutsidePointerDown(event: Event): void {
    if (!this.isDropdownOpen) return;
    const target = event.target;
    if (target && this.elementRef.nativeElement.contains(target)) return;
    this.isDropdownOpen = false;
    this.assigneeQuery = '';
  }

  /**
   * Adds or removes a contact from the current selection.
   * @param contact Contact to toggle.
   * @param event Optional trigger event used to stop propagation.
   */
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

  /**
   * Returns whether a contact is currently selected.
   * @param contact Contact to check.
   * @returns `true` if the contact is selected.
   */
  isSelected(contact: Contact): boolean {
    return this.selectedContacts.some((item) => item.id === contact.id);
  }

  /**
   * Provides a stable identity for contact list rendering.
   * @param contact Contact item from the rendered list.
   * @param index Fallback index when no ID is available.
   * @returns Stable key value for track-by usage.
   */
  getContactId(contact: Contact, index: number): string {
    return contact.id ?? `${contact.name}-${index}`;
  }
}
