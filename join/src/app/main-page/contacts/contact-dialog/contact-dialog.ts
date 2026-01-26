import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-contact-dialog',
  imports: [FormsModule],
  templateUrl: './contact-dialog.html',
  styleUrl: './contact-dialog.scss',
})
export class ContactDialog {

  @ViewChild('contactDialog')
  dialog!: ElementRef<HTMLDialogElement>;

  contactData = {
    name: '',
    email: '',
    phone: '',
  };

  openDialog(): void {
    const el = this.dialog.nativeElement;
    el.showModal();
    el.classList.add('opened');
  }

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

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    console.log('Contact created:', this.contactData);
    form.resetForm();
  }
}
