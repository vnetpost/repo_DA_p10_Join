import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Timestamp } from '@angular/fire/firestore';
import { Contact, ContactAvatar } from '../../../shared/interfaces/contact';
import { ContactFormData } from '../../../shared/interfaces/contact-form-data';
import { getContactAvatarSrc, getTwoInitials } from '../../../shared/utilities/utils';

@Component({
  selector: 'app-contact-dialog',
  imports: [FormsModule],
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
  @ViewChild('avatarInput') avatarInput?: ElementRef<HTMLInputElement>;
  @Input() canDelete = true;
  @Input() canUploadAvatar = false;
  dialogMode: 'add' | 'edit' = 'add';
  readonly getTwoInitials = getTwoInitials;
  userColor: string | null = null;
  showDeleteConfirm: boolean = false;
  avatar: ContactAvatar | null = null;
  avatarPreviewSrc: string | null = null;
  readonly avatarAllowedMimeTypes = ['image/jpeg', 'image/png'];
  readonly avatarMaxWidth = 800;
  readonly avatarMaxHeight = 800;
  readonly avatarQuality = 0.8;

  @Output() saveContact = new EventEmitter<ContactFormData>();
  // @Output() deleteContact = new EventEmitter<string>();
  @Output() requestDelete = new EventEmitter<void>();

  contactData: ContactFormData = {
    name: '',
    email: '',
    phone: '',
  };

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

    this.contactData = {
      name: '',
      email: '',
      phone: '',
    };
    this.userColor = null;
    this.avatar = null;
    this.avatarPreviewSrc = null;

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

    this.contactData.name = contact.name;
    this.contactData.email = contact.email;
    this.contactData.phone = String(contact.phone);
    this.userColor = contact.userColor ?? null;
    this.avatar = contact.avatar ?? null;
    this.avatarPreviewSrc = getContactAvatarSrc(contact);

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
    const el = this.dialog.nativeElement;
    el.showModal();
    el.classList.add('opened');
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
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    const formData: ContactFormData = {
      name: this.contactData.name,
      email: this.contactData.email,
      phone: this.contactData.phone,
    };
    if (this.dialogMode === 'edit') formData.avatar = this.avatar ?? null;
    this.saveContact.emit(formData);

    this.closeDialog();

    if (this.dialogMode === 'add') {
      form.resetForm({
        name: '',
        email: '',
        phone: '',
      });
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
    const el = this.dialog.nativeElement;
    el.classList.remove('opened');
    el.close();

    queueMicrotask(() => {
      this.contactForm.resetForm({
        name: '',
        email: '',
        phone: '',
      });
    });
    if (this.avatarInput) this.avatarInput.nativeElement.value = '';
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
    if (event.target === this.dialog.nativeElement) {
      this.closeDialog();
    }
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
    event.preventDefault();
    this.closeDialog();
  }
  // #endregion

  @HostListener('contextmenu', ['$event'])
  /**
   * Prevents the default context menu on the contacts page.
   */
  onContextMenu(event: Event): void {
    event.preventDefault();
  }

  /**
   * Opens the avatar file picker for editable own-contact profiles.
   *
   * @param event Triggering click event.
   * @returns void
   */
  openAvatarPicker(event?: Event): void {
    event?.stopPropagation();
    if (!this.canUploadAvatar || this.dialogMode !== 'edit') return;
    this.avatarInput?.nativeElement.click();
  }

  /**
   * Handles avatar image selection and stores it as contact avatar payload.
   *
   * @param event Native input change event.
   * @returns Promise<void>
   */
  async onAvatarSelected(event: Event): Promise<void> {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    if (!this.avatarAllowedMimeTypes.includes(file.type)) {
      if (this.avatarInput) this.avatarInput.nativeElement.value = '';
      return;
    }

    const compressedDataUrl = await this.compressImage(
      file,
      this.avatarMaxWidth,
      this.avatarMaxHeight,
      this.avatarQuality,
    );
    const fallbackDataUrl = compressedDataUrl ? null : await this.readFileAsDataUrl(file);
    const dataUrl = compressedDataUrl ?? fallbackDataUrl;
    if (!dataUrl) return;

    const base64 = this.extractBase64FromDataUrl(dataUrl);
    if (!base64) return;

    const fileType = this.extractMimeTypeFromDataUrl(dataUrl) || file.type || 'image/jpeg';
    const fileName = this.buildFileNameForMimeType(file.name || 'avatar.jpg', fileType);

    this.avatar = {
      fileName,
      fileType,
      base64Size: base64.length,
      base64,
      uploadedAt: Timestamp.now(),
    };
    this.avatarPreviewSrc = `data:${fileType};base64,${base64}`;
    if (this.avatarInput) this.avatarInput.nativeElement.value = '';
  }

  /**
   * Reads a file and returns a Base64 data URL.
   *
   * @param file Selected file.
   * @returns Promise resolving to data URL or `null`.
   */
  private readFileAsDataUrl(file: File): Promise<string | null> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Compresses an image file while keeping aspect ratio.
   * Returns a JPEG data URL.
   */
  private compressImage(
    file: File,
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.8,
  ): Promise<string | null> {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result !== 'string') {
          resolve(null);
          return;
        }

        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(null);
            return;
          }

          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            } else {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          canvas.width = Math.round(width);
          canvas.height = Math.round(height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          resolve(canvas.toDataURL('image/jpeg', quality));
        };

        img.onerror = () => resolve(null);
        img.src = result;
      };

      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Extracts MIME type from a data URL header.
   *
   * @param dataUrl Data URL string.
   * @returns MIME type or empty string.
   */
  private extractMimeTypeFromDataUrl(dataUrl: string): string {
    const mimeMatch = dataUrl.match(/^data:([^;]+);base64,/i);
    return mimeMatch?.[1]?.trim() || '';
  }

  /**
   * Extracts pure base64 payload from a data URL.
   *
   * @param dataUrl Data URL string.
   * @returns Raw base64 value.
   */
  private extractBase64FromDataUrl(dataUrl: string): string {
    const separatorIndex = dataUrl.indexOf(',');
    if (separatorIndex === -1) return dataUrl;
    return dataUrl.slice(separatorIndex + 1);
  }

  /**
   * Adapts filename extension to the resulting mime type.
   */
  private buildFileNameForMimeType(fileName: string, mimeType: string): string {
    const lastDotIndex = fileName.lastIndexOf('.');
    const baseName = lastDotIndex === -1 ? fileName : fileName.slice(0, lastDotIndex);

    if (mimeType === 'image/jpeg') return `${baseName}.jpg`;
    if (mimeType === 'image/png') return `${baseName}.png`;
    return fileName;
  }
  // #endregion
}
