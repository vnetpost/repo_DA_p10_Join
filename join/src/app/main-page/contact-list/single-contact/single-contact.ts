import { Component, Input } from '@angular/core';
import { Contact } from '../../../shared/interfaces/contact';
import { getTwoInitials } from '../../../shared/utilities/utils';

@Component({
  selector: 'app-single-contact',
  imports: [],
  templateUrl: './single-contact.html',
  styleUrl: './single-contact.scss',
})
export class SingleContact {
  @Input() contact?: Contact;

  readonly getTwoInitials = getTwoInitials;
}
