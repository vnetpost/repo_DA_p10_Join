import { Component, inject } from '@angular/core';
import { FirebaseService } from '../shared/services/firebase-service';
import { RouterLink } from "@angular/router";
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-main-page',
  imports: [RouterLink, FormsModule],
  templateUrl: './main-page.html',
  styleUrl: './main-page.scss',
})
export class MainPage {
  firebaseService = inject(FirebaseService);
  signUp = false;
  confirmPassword = '';
  showLogInPassword = false;
  showSignUpPassword = false;
  showConfirmPassword = false;

  openSignUp(): void {
    this.signUp = true;
  }

  closeSignUp(): void {
    this.signUp = false;
  }

  toggleLogInPassword(): void {
    this.showLogInPassword = !this.showLogInPassword;
  }

  toggleSignUpPassword(): void {
    this.showSignUpPassword = !this.showSignUpPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  logInData: any = {
    email: '',
    password: '',
  };

  signUpData: any = {
    name: '',
    email: '',
    password: '',
  };

  onLogin(form: NgForm): void {
    if (form.invalid) {
      return;
    }

    console.log('Login:', this.logInData);
  }

  onSignUp(form: NgForm): void {
    if (form.invalid || this.signUpData.password !== this.confirmPassword) {
      return;
    }

    this.signUpData.password = this.signUpData.password;

    console.log('Sign up:', this.signUpData);
  }
}
