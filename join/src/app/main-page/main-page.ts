import { Component, inject, OnInit } from '@angular/core';
import { FirebaseService } from '../shared/services/firebase-service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { LogInFormData, SignUpFormData } from '../shared/interfaces/login-form-data';

@Component({
  selector: 'app-main-page',
  imports: [RouterLink, FormsModule],
  templateUrl: './main-page.html',
  styleUrl: './main-page.scss',
})
export class MainPage implements OnInit {
  firebaseService = inject(FirebaseService);
  router = inject(Router);
  isMobile = false;
  isLoggedIn = false;
  isGuest = false;
  showSignUp = false;

  introActive = true;
  logoMoving = false;

  confirmPassword = '';
  showLogInPassword = false;
  showSignUpPassword = false;
  showConfirmPassword = false;

  ngOnInit(): void {
    this.checkScreen();

    window.addEventListener('resize', () => {
      this.checkScreen();
    });
    
    const guest = localStorage.getItem('guest');

    if (guest) {
      this.isLoggedIn = true;
      this.router.navigate(['/summary']);
      return;
    }

    this.showIntro();
  }

  checkScreen(): void {
    this.isMobile = window.innerWidth < 1025;
  }

  showIntro(): void {
    setTimeout(() => {
      this.logoMoving = true;
    }, 300);

    setTimeout(() => {
      this.introActive = false;
    }, 1400);
  }

  openSignUp(): void {
    this.showSignUp = true;
  }

  closeSignUp(): void {
    this.showSignUp = false;
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

  logInData: LogInFormData = {
    email: '',
    password: '',
  };

  signUpData: SignUpFormData = {
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

  guestLogin(): void {
    this.isLoggedIn = true;
    this.isGuest = true;

    this.router.navigate(['/summary']);
  }
}
