import { Component } from '@angular/core';
import { ContactList } from './contact-list/contact-list';
import { ContactInfo } from './contact-info/contact-info';
import { ContactDialog } from './contact-dialog/contact-dialog';

@Component({
  selector: 'app-contacts',
  imports: [ContactList, ContactInfo, ContactDialog],
  templateUrl: './contacts.html',
  styleUrl: './contacts.scss',
})
export class Contacts {

}
