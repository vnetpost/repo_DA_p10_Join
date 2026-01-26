import { Component, HostListener, inject } from '@angular/core';
import { ContactList } from './contact-list/contact-list';
import { ContactInfo } from './contact-info/contact-info';
import { ContactDialog } from './contact-dialog/contact-dialog';
import { FirebaseService } from '../../shared/services/firebase-service';
import { Contact } from '../../shared/interfaces/contact';

@Component({
  selector: 'app-contacts',
  imports: [ContactList, ContactInfo],
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

  openContactDialog(): void {}

  @HostListener('contextmenu', ['$event'])
  onContextMenu(event: Event): void {
    event.preventDefault();
  }
}
