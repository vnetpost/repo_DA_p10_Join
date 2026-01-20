import { Component, inject } from '@angular/core';
import { ContactList } from './contact-list/contact-list';
import { ContactDialog } from './contact-dialog/contact-dialog';
import { ContactInfo } from './contact-info/contact-info';
import { FirebaseService } from '../shared/services/firebase-service';

@Component({
  selector: 'app-main-page',
  imports: [ContactList, ContactInfo,  ContactDialog],
  templateUrl: './main-page.html',
  styleUrl: './main-page.scss',
})
export class MainPage {
  firebaseService = inject(FirebaseService);
}
