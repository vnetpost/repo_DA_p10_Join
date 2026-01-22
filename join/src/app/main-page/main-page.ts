import { Component, inject } from '@angular/core';
import { FirebaseService } from '../shared/services/firebase-service';

@Component({
  selector: 'app-main-page',
  imports: [],
  templateUrl: './main-page.html',
  styleUrl: './main-page.scss',
})
export class MainPage {
  firebaseService = inject(FirebaseService);
}
