import { Contact } from '../../../shared/interfaces/contact';

/**
 * Manages the delete-confirmation dialog state for the contacts page.
 */
export class ContactsDeleteDialog {
  contactToDelete: Contact | null = null;

  /**
   * Opens the delete-confirmation dialog for one contact.
   *
   * @param dialogElement Native dialog element used for the confirmation UI.
   * @param contact The contact targeted for deletion.
   * @returns void
   */
  open(dialogElement: HTMLDialogElement, contact: Contact): void {
    this.contactToDelete = contact;
    dialogElement.showModal();
    dialogElement.classList.add('opened');
  }

  /**
   * Closes the delete-confirmation dialog and clears the selected contact.
   *
   * @param dialogElement Native dialog element used for the confirmation UI.
   * @returns void
   */
  close(dialogElement: HTMLDialogElement): void {
    this.contactToDelete = null;
    dialogElement.close();
    dialogElement.classList.remove('opened');
  }
}
