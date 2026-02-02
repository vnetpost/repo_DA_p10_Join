import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Contact } from '../../shared/interfaces/contact';
import { Task } from '../../shared/interfaces/task';
import { FirebaseService } from '../../shared/services/firebase-service';
import { getTwoInitials } from '../../shared/utilities/utils';
import { ContactService } from '../../shared/services/contact-service';
import { TaskService } from '../../shared/services/task-service';

@Component({
  selector: 'app-add-task',
  imports: [FormsModule],
  templateUrl: './add-task.html',
  styleUrl: './add-task.scss',
})
export class AddTask {
  firebaseService = inject(FirebaseService);
  contactService = inject(ContactService);
  taskService = inject(TaskService);

  getTwoInitials = getTwoInitials;
  
  assignedDropdownOpen = false;
  selectedContacts: Contact[] = [];
  assignedQuery = '';
  categoryDropdownOpen = false;
  selectedCategory: { value: Task['category']; label: string } | null = null;

  get assignedToLabel(): string {
    if (!this.selectedContacts.length) return '';
    return this.selectedContacts.map((contact) => contact.name).join(', ');
  }

  get selectedCategoryLabel(): string {
    return this.selectedCategory?.label ?? '';
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
    if (this.assignedDropdownOpen) {
      this.categoryDropdownOpen = false;
    }
    if (!this.assignedDropdownOpen) {
      this.assignedQuery = '';
    }
  }

  toggleCategoryDropdown(): void {
    this.categoryDropdownOpen = !this.categoryDropdownOpen;
    if (this.categoryDropdownOpen) {
      this.assignedDropdownOpen = false;
    }
  }

  selectCategory(category: { value: Task['category']; label: string }, event?: Event): void {
    event?.stopPropagation();
    this.selectedCategory = category;
    this.categoryDropdownOpen = false;
  }

  toggleContact(contact: Contact, event?: Event): void {
    event?.stopPropagation();
    const index = this.selectedContacts.findIndex((item) => item.id === contact.id);
    if (index === -1) {
      this.selectedContacts.push(contact);
      return;
    }
    this.selectedContacts.splice(index, 1);
  }

  isSelected(contact: Contact): boolean {
    return this.selectedContacts.some((item) => item.id === contact.id);
  }

  getContactId(contact: Contact, index: number): string {
    return contact.id ?? `${contact.name}-${index}`;
  }
}
