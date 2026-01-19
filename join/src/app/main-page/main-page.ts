import { Component } from '@angular/core';
import { ContactList } from './contact-list/contact-list';
import { ContactDialog } from './contact-dialog/contact-dialog';
import { ContactInfo } from './contact-info/contact-info';

@Component({
  selector: 'app-main-page',
  imports: [ContactList, ContactInfo, ContactDialog],
  templateUrl: './main-page.html',
  styleUrl: './main-page.scss',
})
export class MainPage {}
