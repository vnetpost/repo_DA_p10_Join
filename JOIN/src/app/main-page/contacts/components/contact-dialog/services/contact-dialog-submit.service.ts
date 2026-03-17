import { Injectable } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ContactAvatar } from '../../../../../shared/interfaces/contact';
import { ContactFormData } from '../../../../../shared/interfaces/contact-form-data';

export type ContactDialogMode = 'add' | 'edit';

export type ContactDialogSubmitResult = {
  formData: ContactFormData;
};

/**
 * Prepares validated contact-dialog submissions for add and edit mode.
 */
@Injectable({
  providedIn: 'root',
})
export class ContactDialogSubmitService {
  /**
   * Validates the dialog form and builds the emitted payload.
   *
   * @param form Angular form instance bound to the dialog.
   * @param dialogMode Current dialog mode.
   * @param contactData Mutable form model from the dialog component.
   * @param avatar Current avatar payload used in edit mode.
   * @returns A prepared submit result or `null` when the form is invalid.
   */
  submit(
    form: NgForm,
    dialogMode: ContactDialogMode,
    contactData: ContactFormData,
    avatar: ContactAvatar | null,
  ): ContactDialogSubmitResult | null {
    if (this.isInvalidForm(form)) return null;
    return {
      formData: this.buildFormData(dialogMode, contactData, avatar),
    };
  }

  /**
   * Checks whether the form is invalid and touches all fields when needed.
   *
   * @param form Angular form instance bound to the dialog.
   * @returns `true` when submission should be blocked.
   */
  private isInvalidForm(form: NgForm): boolean {
    if (!form.invalid) return false;
    form.control.markAllAsTouched();
    return true;
  }

  /**
   * Builds the emitted contact payload for add or edit mode.
   *
   * @param dialogMode Current dialog mode.
   * @param contactData Mutable form model from the dialog component.
   * @param avatar Current avatar payload used in edit mode.
   * @returns The normalized contact form data to emit.
   */
  private buildFormData(
    dialogMode: ContactDialogMode,
    contactData: ContactFormData,
    avatar: ContactAvatar | null,
  ): ContactFormData {
    const formData: ContactFormData = {
      name: contactData.name,
      email: contactData.email,
      phone: contactData.phone,
    };

    if (dialogMode === 'edit') formData.avatar = avatar ?? null;
    return formData;
  }
}
