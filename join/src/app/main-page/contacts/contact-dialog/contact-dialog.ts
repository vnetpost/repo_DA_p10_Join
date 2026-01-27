import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Contact } from '../../../shared/interfaces/contact';
import { ContactFormData } from '../../../shared/interfaces/contact-form-data';
import { getTwoInitials } from '../../../shared/utilities/utils';

@Component({
  selector: 'app-contact-dialog',
  imports: [FormsModule],
  templateUrl: './contact-dialog.html',
  styleUrl: './contact-dialog.scss',
})
export class ContactDialog {
  @ViewChild('contactDialog')
  dialog!: ElementRef<HTMLDialogElement>;
  dialogMode: 'add' | 'edit' = 'add';
  readonly getTwoInitials = getTwoInitials;
  userColor: string | null = null;

  @Output() saveContact = new EventEmitter<ContactFormData>();
  @Output() deleteContact = new EventEmitter<string>();

  contactData: ContactFormData = {
    name: '',
    email: '',
    phone: '',
  };

  // #region Methods
  // #region Opening dialog
  openAddDialog(): void {
    this.dialogMode = 'add';

    this.contactData = {
      name: '',
      email: '',
      phone: '',
    };

    this.openDialog();
  }

  openEditDialog(contact: Contact): void {
    this.dialogMode = 'edit';

    this.contactData.name = contact.name;
    this.contactData.email = contact.email;
    this.contactData.phone = String(contact.phone);
    this.userColor = contact.userColor ?? null;

    this.openDialog();
  }

  openDialog(): void {
    const el = this.dialog.nativeElement;
    el.showModal();
    el.classList.add('opened');
  }
  // #endregion

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    this.saveContact.emit({
      name: this.contactData.name,
      email: this.contactData.email,
      phone: this.contactData.phone,
    });

    this.closeDialog();

    if (this.dialogMode === 'add') {
      form.resetForm({
        name: '',
        email: '',
        phone: '',
      });
    }
  }

  onDeleteClick(): void {
    this.deleteContact.emit();
    this.closeDialog();
  }


  // #region Closing dialog
  closeDialog(): void {
    const el = this.dialog.nativeElement;
    el.classList.remove('opened');
    el.close();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === this.dialog.nativeElement) {
      this.closeDialog();
    }
  }

  onEsc(event: Event): void {
    event.preventDefault();
    this.closeDialog();
  }
  // #endregion
  // #endregion
}
