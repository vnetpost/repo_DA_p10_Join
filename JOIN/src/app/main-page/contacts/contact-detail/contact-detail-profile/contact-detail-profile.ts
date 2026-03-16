import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Contact } from '../../../../shared/interfaces/contact';
import { getContactAvatarSrc, getTwoInitials } from '../../../../shared/utilities/utils';

/**
 * Renders the contact avatar, name and desktop action buttons.
 */
@Component({
  selector: 'app-contact-detail-profile',
  imports: [],
  templateUrl: './contact-detail-profile.html',
  styleUrl: './contact-detail-profile.scss',
})
export class ContactDetailProfile {
  @Input({ required: true }) contact!: Contact;
  @Input() canDelete = true;
  @Output() editContact = new EventEmitter<void>();
  @Output() requestDelete = new EventEmitter<void>();

  readonly getTwoInitials = getTwoInitials;
  readonly getContactAvatarSrc = getContactAvatarSrc;
}
