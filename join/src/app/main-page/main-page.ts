import { Component, inject } from '@angular/core';
import { ContactList } from './contacts/contact-list/contact-list';
import { ContactDialog } from './contacts/contact-dialog/contact-dialog';
import { ContactInfo } from './contacts/contact-info/contact-info';
import { FirebaseService } from '../shared/services/firebase-service';

@Component({
  selector: 'app-main-page',
  imports: [ContactList, ContactInfo, ContactDialog],
  templateUrl: './main-page.html',
  styleUrl: './main-page.scss',
})
export class MainPage {
  firebaseService = inject(FirebaseService);
}
