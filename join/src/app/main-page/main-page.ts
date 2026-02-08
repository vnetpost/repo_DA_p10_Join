import { Component, inject } from '@angular/core';
import { FirebaseService } from '../shared/services/firebase-service';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-main-page',
  imports: [RouterLink],
  templateUrl: './main-page.html',
  styleUrl: './main-page.scss',
})
export class MainPage {
  firebaseService = inject(FirebaseService);
  signUp = false;

  openSignUp(): void{
    this.signUp = true;
  }

  closeSignUp(): void{
    this.signUp = false;
  }
}
