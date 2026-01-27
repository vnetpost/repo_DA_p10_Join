import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Contact } from '../../../shared/interfaces/contact';
import { getTwoInitials } from '../../../shared/utilities/utils';

@Component({
  selector: 'app-contact-info',
  imports: [],
  templateUrl: './contact-info.html',
  styleUrl: './contact-info.scss',
})
export class ContactInfo {
  @Input() activeContact: Contact | null = null;
  @Output() back = new EventEmitter<void>();
  @Output() editContact = new EventEmitter<void>();
  @Output() deleteContact = new EventEmitter<void>();

  readonly getTwoInitials = getTwoInitials;

  handleBack(event: Event): void {
    event.preventDefault();
    this.back.emit();
  }
}
