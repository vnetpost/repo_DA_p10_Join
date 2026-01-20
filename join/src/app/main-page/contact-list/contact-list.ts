import { Component, inject } from '@angular/core';
import { SingleContact } from './single-contact/single-contact';
import { FirebaseService } from '../../shared/services/firebase-service';

@Component({
  selector: 'app-contact-list',
  imports: [SingleContact],
  templateUrl: './contact-list.html',
  styleUrl: './contact-list.scss',
})
export class ContactList {
  firebaseService = inject(FirebaseService);
  
}
