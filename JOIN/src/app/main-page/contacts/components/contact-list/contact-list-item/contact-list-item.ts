import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Contact } from '../../../../../shared/interfaces/contact';
import { getContactAvatarSrc, getTwoInitials } from '../../../../../shared/utilities/utils';

@Component({
  selector: 'app-contact-list-item',
  imports: [],
  templateUrl: './contact-list-item.html',
  styleUrl: './contact-list-item.scss',
})
/**
 * Displays a single contact row and emits selection when clicked.
 */
export class ContactListItem {
  @Input() contact?: Contact;
  @Input() isActive = false;
  @Output() selected = new EventEmitter<Contact>();

  readonly getTwoInitials = getTwoInitials;
  readonly getContactAvatarSrc = getContactAvatarSrc;

  /**
   * Emits the current contact as the selected item.
   */
  setContactAsSelected() {
    this.selected.emit(this.contact);
  }
}
