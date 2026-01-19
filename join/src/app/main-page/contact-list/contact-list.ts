import { Component } from '@angular/core';
import { SingleContact } from './single-contact/single-contact';

@Component({
  selector: 'app-contact-list',
  imports: [SingleContact],
  templateUrl: './contact-list.html',
  styleUrl: './contact-list.scss',
})
export class ContactList {}
