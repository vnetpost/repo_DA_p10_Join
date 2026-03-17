import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContactFormData } from '../../../../../../shared/interfaces/contact-form-data';

/**
 * Renders the editable contact form fields and their validation messages.
 */
@Component({
  selector: 'app-contact-dialog-form-fields',
  imports: [FormsModule],
  templateUrl: './contact-dialog-form-fields.html',
  styleUrl: './contact-dialog-form-fields.scss',
})
export class ContactDialogFormFields {
  @Input({ required: true }) contactData!: ContactFormData;
  @Input() dialogMode: 'add' | 'edit' = 'add';
}
