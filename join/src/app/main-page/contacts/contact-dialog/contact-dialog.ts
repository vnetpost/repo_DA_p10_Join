import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Contact } from '../../../shared/interfaces/contact';

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
  // dialogMode: 'add' | 'edit' = 'edit';

  contactData = {
    name: '',
    email: '',
    phone: '',
  };

  @Output() save = new EventEmitter<Contact>();
  @Output() delete = new EventEmitter<string>();


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

    if (this.dialogMode === 'add') {
      this.createContact();
    } else {
      this.updateContact();

    }

    this.closeDialog();
    form.resetForm({
      name: '',
      email: '',
      phone: '',
    });
  }

  createContact(): void {
    console.log('Created:', this.contactData);
  }

  updateContact(): void {
    console.log('Updated:', this.contactData);
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
