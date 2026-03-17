import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Contact, ContactAvatar } from '../../../shared/interfaces/contact';
import { ContactFormData } from '../../../shared/interfaces/contact-form-data';
import { getContactAvatarSrc } from '../../../shared/utilities/utils';
import { ContactDialogUiState } from './contact-dialog-ui-state';
import {
  captureContactDialogSnapshot,
  ContactDialogSnapshot,
  hasContactDialogChanges,
} from './contact-dialog-snapshot.utils';
import {
  ContactDialogAvatar,
  ContactDialogAvatarChange,
} from './contact-dialog-avatar/contact-dialog-avatar';
import { ContactDialogFormFields } from './contact-dialog-form-fields/contact-dialog-form-fields';
import { ContactDialogSubmitService } from './contact-dialog-submit.service';

@Component({
  selector: 'app-contact-dialog',
  imports: [FormsModule, ContactDialogAvatar, ContactDialogFormFields],
  templateUrl: './contact-dialog.html',
  styleUrl: './contact-dialog.scss',
})
/**
 * ContactDialog component
 *
 * Provides a modal dialog for adding and editing contacts.
 * Manages dialog state, form validation, and user interactions
 * such as saving or deleting a contact.
 */
export class ContactDialog {
  @ViewChild('contactDialog') dialog!: ElementRef<HTMLDialogElement>;
  @ViewChild('contactForm') contactForm!: NgForm;
  @Input() canDelete = true;
  @Input() canUploadAvatar = false;
  dialogMode: 'add' | 'edit' = 'add';
  private readonly uiState = new ContactDialogUiState();
  private readonly contactDialogSubmitService = inject(ContactDialogSubmitService);
  userColor: string | null = null;
  showDeleteConfirm: boolean = false;
  isSubmitting: boolean = false;
  avatar: ContactAvatar | null = null;
  avatarPreviewSrc: string | null = null;

  @Output() saveContact = new EventEmitter<ContactFormData>();
  // @Output() deleteContact = new EventEmitter<string>();
  @Output() requestDelete = new EventEmitter<void>();

  contactData: ContactFormData = {
    name: '',
    email: '',
    phone: '',
  };
  private initialDialogSnapshot: ContactDialogSnapshot = {
    name: '',
    email: '',
    phone: '',
    avatarSignature: '',
  };

  /**
   * Exposes the close-confirmation visibility managed by the local dialog UI state.
   *
   * @returns `true` when the close confirmation is visible.
   */
  get showCloseConfirm(): boolean {
    return this.uiState.showCloseConfirm;
  }

  // #region Methods
  // #region Opening dialog

  /**
   * Opens the dialog in add mode.
   *
   * Resets all form fields and prepares the dialog
   * for creating a new contact.
   *
   * @returns void
   */
  openAddDialog(): void {
    this.dialogMode = 'add';
    this.isSubmitting = false;

    this.contactData = {
      name: '',
      email: '',
      phone: '',
    };
    this.userColor = null;
    this.avatar = null;
    this.avatarPreviewSrc = null;
    this.initialDialogSnapshot = captureContactDialogSnapshot(this.contactData, this.avatar);

    this.openDialog();
  }

  /**
   * Opens the dialog in edit mode.
   *
   * Loads the provided contact data into the form
   * and prepares the dialog for editing.
   *
   * @param contact The contact whose data should be edited
   * @returns void
   */
  openEditDialog(contact: Contact): void {
    this.dialogMode = 'edit';
    this.isSubmitting = false;

    this.contactData.name = contact.name;
    this.contactData.email = contact.email;
    this.contactData.phone = String(contact.phone);
    this.userColor = contact.userColor ?? null;
    this.avatar = contact.avatar ?? null;
    this.avatarPreviewSrc = getContactAvatarSrc(contact);
    this.initialDialogSnapshot = captureContactDialogSnapshot(this.contactData, this.avatar);

    this.openDialog();
  }

  /**
   * Displays the dialog as a modal window.
   *
   * Applies the active dialog state and visual styling.
   *
   * @returns void
   */
  openDialog(): void {
    this.isSubmitting = false;
    this.uiState.openDialog(this.dialog.nativeElement);
  }
  // #endregion

  /**
   * Handles form submission.
   *
   * Validates the form, emits the save event with
   * the entered contact data, and closes the dialog.
   * In add mode, the form is reset after submission.
   *
   * @param form The Angular form instance
   * @returns void
   */
  onSubmit(form: NgForm): void {
    if (this.isSubmitting) return;
    const submitResult = this.contactDialogSubmitService.submit(
      form,
      this.dialogMode,
      this.contactData,
      this.avatar,
    );
    if (!submitResult) return;

    this.isSubmitting = true;

    try {
      this.saveContact.emit(submitResult.formData);
      this.closeDialog();
    } catch (error) {
      this.isSubmitting = false;
      throw error;
    }
  }

  /**
   * Handles the delete action.
   *
   * Emits the delete event and closes the dialog.
   *
   * @returns void
   */
  onDeleteClick(): void {
    this.requestDelete.emit();
  }

  // #region Closing dialog

  /**
   * Closes the dialog.
   *
   * Removes the active dialog state and closes
   * the native dialog element.
   *
   * @returns void
   */
  closeDialog(): void {
    this.uiState.closeDialog(this.dialog.nativeElement, () => {
      this.isSubmitting = false;
    });

    queueMicrotask(() => {
      this.contactForm?.resetForm({
        name: '',
        email: '',
        phone: '',
      });
    });
  }

  /**
   * Handles clicks on the dialog backdrop.
   *
   * Closes the dialog only when the backdrop itself
   * was clicked.
   *
   * @param event The mouse event triggered by the click
   * @returns void
   */
  onBackdropClick(event: MouseEvent): void {
    this.uiState.handleBackdropClick(event, this.dialog.nativeElement, () =>
      this.requestCloseDialog()
    );
  }

  /**
   * Handles the Escape key interaction.
   *
   * Prevents the default browser behavior
   * and closes the dialog manually.
   *
   * @param event The triggered escape event
   * @returns void
   */
  onEsc(event: Event): void {
    this.uiState.handleEscape(event, () => this.requestCloseDialog());
  }
  // #endregion

  /**
   * Opens a warning before closing the add-contact dialog with entered content.
   *
   * @returns void
   */
  requestCloseDialog(): void {
    this.uiState.requestCloseDialog(() => this.shouldConfirmClose(), () => this.closeDialog());
  }

  /**
   * Confirms the close action and discards the current dialog values.
   *
   * @returns void
   */
  confirmCloseDialog(): void {
    this.uiState.confirmCloseDialog(() => this.closeDialog());
  }

  /**
   * Keeps the contact dialog open and hides the close confirmation.
   *
   * @returns void
   */
  cancelCloseDialog(): void {
    this.uiState.cancelCloseDialog();
  }

  /**
   * Prevents the default context menu on the contacts page.
   *
   * @param event The triggering context-menu event.
   * @returns void
   */
  @HostListener('contextmenu', ['$event'])
  onContextMenu(event: Event): void {
    event.preventDefault();
  }

  /**
   * Applies an updated avatar payload emitted by the avatar child component.
   *
   * @param avatarChange The newly processed avatar payload and preview source.
   * @returns void
   */
  applyAvatarChange(avatarChange: ContactDialogAvatarChange): void {
    this.avatar = avatarChange.avatar;
    this.avatarPreviewSrc = avatarChange.previewSrc;
  }

  /**
   * Checks whether the current form differs from the initially opened dialog state.
   *
   * @returns `true` if closing should require confirmation.
   */
  private shouldConfirmClose(): boolean {
    return hasContactDialogChanges(this.initialDialogSnapshot, this.contactData, this.avatar);
  }
  // #endregion
}
