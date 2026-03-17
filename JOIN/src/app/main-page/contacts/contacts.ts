import { Component, DoCheck, ElementRef, HostListener, OnDestroy, inject, ViewChild } from '@angular/core';
import { ContactList } from './components/contact-list/contact-list';
import { ContactDetail } from './components/contact-detail/contact-detail';
import { ContactDialog } from './components/contact-dialog/contact-dialog';
import { ContactService } from '../../shared/services/contact.service';
import { Contact } from '../../shared/interfaces/contact';
import { ContactFormData } from '../../shared/interfaces/contact-form-data';
import { AuthService } from '../../shared/services/auth.service';
import { ContactsUiState } from './state/contacts-ui-state';
import { ContactsDeleteDialog } from './state/contacts-delete-dialog';

@Component({
  selector: 'app-contacts',
  imports: [ContactList, ContactDetail, ContactDialog],
  templateUrl: './contacts.html',
  styleUrl: './contacts.scss',
})
/**
 * Contacts component
 *
 * Acts as the main container for the contacts page.
 * Coordinates list, detail, dialog, and deletion flows
 * and manages responsive behavior.
 */
export class Contacts implements DoCheck, OnDestroy {
  contactService = inject(ContactService);
  authService = inject(AuthService);
  private lastContactsVersion = 0;
  private readonly uiState = new ContactsUiState(768);
  private readonly deleteDialogState = new ContactsDeleteDialog();

  activeContactID: string | null = null;
  activeContact: Contact | null = null;

  @ViewChild(ContactDialog) dialog!: ContactDialog;
  @ViewChild('confirmDialog') confirmDialog!: ElementRef<HTMLDialogElement>;

  constructor() {
    this.updateIsMobile();
  }

  /**
   * Indicates whether the contacts page is currently rendered in mobile mode.
   *
   * @returns `true` when the viewport is at or below the mobile breakpoint.
   */
  get isMobile(): boolean {
    return this.uiState.isMobile;
  }

  /**
   * Indicates whether the mobile detail panel is currently open.
   *
   * @returns `true` when the contact detail view is open on mobile.
   */
  get isDetailOpen(): boolean {
    return this.uiState.isDetailOpen;
  }

  /**
   * Indicates whether the "contact created" toast is visible.
   *
   * @returns `true` when the toast is visible.
   */
  get toastVisible(): boolean {
    return this.uiState.toastVisible;
  }

  /**
   * Exposes the contact currently queued for deletion.
   *
   * @returns The contact waiting for delete confirmation, or `null`.
   */
  get contactToDelete(): Contact | null {
    return this.deleteDialogState.contactToDelete;
  }

  /**
   * Detects changes to the contacts collection.
   *
   * Keeps the active contact in sync when
   * contact data is updated externally.
   *
   * @returns void
   */
  ngDoCheck(): void {
    if (this.lastContactsVersion === this.contactService.contactsVersion) return;
    this.lastContactsVersion = this.contactService.contactsVersion;
    if (!this.activeContactID) return;

    const updatedContact = this.contactService.findContactById(this.activeContactID);

    if (!updatedContact) return;
    this.activeContact = updatedContact;
  }

  /**
   * Clears timers owned by the contacts page helper state.
   *
   * @returns void
   */
  ngOnDestroy(): void {
    this.uiState.destroy();
  }

  /**
   * Updates the responsive state on viewport resize.
   *
   * @returns void
   */
  @HostListener('window:resize')
  onResize(): void {
    this.updateIsMobile();
  }

  /**
   * Updates the mobile state based on the viewport width.
   *
   * @returns void
   */
  private updateIsMobile(): void {
    this.uiState.updateViewport(window.innerWidth);
  }

  /**
   * Sets the active contact and opens the detail view.
   *
   * @param selection The selected contact and its identifier
   * @returns void
   */
  setActiveContact(selection: { id: string; contact: Contact }): void {
    this.activeContactID = selection.id;
    this.activeContact = selection.contact;
    this.uiState.openDetail();
  }

  /**
   * Closes the contact detail view.
   *
   * @returns void
   */
  closeContactInfo(): void {
    this.uiState.closeDetail();
  }

  /**
   * Prevents the default browser context menu.
   *
   * @param event The context menu event
   * @returns void
   */
  @HostListener('contextmenu', ['$event'])
  onContextMenu(event: Event): void {
    event.preventDefault();
  }

  /**
   * Opens the dialog for creating a new contact.
   *
   * @returns void
   */
  openAddDialog(): void {
    this.dialog.openAddDialog();
  }

  /**
   * Opens the edit dialog for a specific contact.
   *
   * @param contact The contact to edit
   * @returns void
   */
  openEditDialog(contact: Contact): void {
    this.activeContact = contact;
    this.dialog.openEditDialog(contact);
  }

  /**
   * Handles saving of the contact form.
   *
   * Creates a new contact or updates an existing one
   * depending on the dialog mode.
   *
   * @param formData The submitted contact form data
   * @returns Promise<void>
   */
  async onSave(formData: ContactFormData): Promise<void> {
    if (this.dialog.dialogMode === 'add') {
      await this.createContactFromForm(formData);
    } else {
      await this.updateContactFromForm(formData);
    }
  }

  /**
   * Creates a new contact from form data.
   *
   * Sets the created contact as active and
   * opens the detail view on mobile devices.
   *
   * @param data The form data used to create the contact
   * @returns Promise<void>
   */
  async createContactFromForm(data: ContactFormData): Promise<void> {
    const createdContact = await this.contactService.createContactFromForm(data);
    this.showToast();

    if (!createdContact?.id) return;

    this.activeContactID = createdContact.id;
    this.activeContact = createdContact;

    if (this.isMobile) {
      this.uiState.openDetail();
    }
  }

  /**
   * Updates the currently active contact using form data.
   *
   * @param data The updated contact form data
   * @returns void
   */
  async updateContactFromForm(data: ContactFormData): Promise<void> {
    if (!this.activeContact) return;
    const contact = await this.contactService.updateContactFromForm(this.activeContact, data);
    this.activeContact = contact;
    this.activeContactID = contact.id ?? null;
  }

  /**
   * Requests deletion of a contact.
   *
   * Opens the confirmation dialog if deletion is allowed.
   *
   * @param contact The contact to delete
   * @returns void
   */
  requestDelete(contact: Contact): void {
    if (!this.canDeleteContact(contact)) return;
    this.deleteDialogState.open(this.confirmDialog.nativeElement, contact);
  }

  /**
   * Confirms deletion of the selected contact.
   *
   * Removes the contact and resets related UI state.
   *
   * @returns void
   */
  async confirmDelete(): Promise<void> {
    if (!this.contactToDelete?.id) return;

    await this.contactService.deleteContact(this.contactToDelete.id);

    this.activeContact = null;
    this.activeContactID = null;
    this.uiState.resetAfterDelete();
    this.deleteDialogState.close(this.confirmDialog.nativeElement);
  }

  /**
   * Cancels the delete confirmation dialog.
   *
   * @returns void
   */
  cancelDelete(): void {
    this.deleteDialogState.close(this.confirmDialog.nativeElement);
  }

  /**
   * Determines whether a contact can be deleted.
   *
   * Prevents deletion of the currently logged-in user.
   *
   * @param contact The contact to evaluate
   * @returns True if the contact can be deleted
   */
  canDeleteContact(contact: Contact | null): boolean {
    return this.contactService.canDeleteContact(
      contact,
      this.authService.firebaseAuth.currentUser?.email,
    );
  }

  /**
   * Determines whether avatar upload is allowed in contact edit mode.
   *
   * Any authenticated user may upload avatars for contacts.
   *
   * @param contact Contact to evaluate.
   * @returns True if avatar upload should be enabled.
   */
  canEditAvatar(contact: Contact | null): boolean {
    return this.contactService.canEditAvatar(
      contact,
      Boolean(this.authService.firebaseAuth.currentUser),
    );
  }

  /**
   * Displays a temporary toast notification.
   *
   * @returns void
   */
  showToast(): void {
    this.uiState.showToast();
  }
}
