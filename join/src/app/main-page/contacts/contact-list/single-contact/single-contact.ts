import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Contact } from '../../../../shared/interfaces/contact';
import { getTwoInitials } from '../../../../shared/utilities/utils';

@Component({
  selector: 'app-single-contact',
  imports: [],
  templateUrl: './single-contact.html',
  styleUrl: './single-contact.scss',
})
export class SingleContact {
  @Input() contact?: Contact;
  @Input() isActive = false;
  @Output() selected = new EventEmitter<Contact>();

  readonly getTwoInitials = getTwoInitials;

  setContactAsSelected() {
    this.selected.emit(this.contact);
  }
}
