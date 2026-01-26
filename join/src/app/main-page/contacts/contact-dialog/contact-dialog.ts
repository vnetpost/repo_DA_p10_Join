import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-contact-dialog',
  imports: [FormsModule],
  templateUrl: './contact-dialog.html',
  styleUrl: './contact-dialog.scss',
})
export class ContactDialog {
  // showDialog(dialog: HTMLDialogElement): void{
  //   dialog.showModal();
  // }

  contactData = {
    name: '',
    email: '',
    phone: '',
  };

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    console.log('Contact created:', this.contactData);
    form.resetForm();
  }

  // closeDialog(): void {
    
  // }
}
