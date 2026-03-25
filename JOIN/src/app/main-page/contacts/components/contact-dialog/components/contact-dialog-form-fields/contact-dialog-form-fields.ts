import { Component, Input } from '@angular/core';
import { ControlContainer, FormsModule, NgForm } from '@angular/forms';
import { ContactFormData } from '../../../../../../shared/interfaces/contact-form-data';

@Component({
  selector: 'app-contact-dialog-form-fields',
  imports: [FormsModule],
  templateUrl: './contact-dialog-form-fields.html',
  styleUrl: './contact-dialog-form-fields.scss',
  viewProviders: [{ provide: ControlContainer, useExisting: NgForm }],
})
export class ContactDialogFormFields {
  @Input({ required: true }) contactData!: ContactFormData;
  @Input() dialogMode: 'add' | 'edit' = 'add';
}
