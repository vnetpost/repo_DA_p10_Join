import { Component, inject, OnInit } from '@angular/core';
import { FirebaseService } from '../shared/services/firebase-service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { LogInFormData, SignUpFormData } from '../shared/interfaces/login-form-data';
import { AuthService } from '../shared/services/auth-service';
import { AsyncPipe } from '@angular/common';
import { getGreeting } from '../shared/utilities/utils';

@Component({
  selector: 'app-main-page',
  imports: [RouterLink, FormsModule, AsyncPipe],
  templateUrl: './main-page.html',
  styleUrl: './main-page.scss',
})
export class MainPage implements OnInit {
  firebaseService = inject(FirebaseService);
  router = inject(Router);
  authService = inject(AuthService);
  user$ = this.authService.user$;

  isMobile = false;
  showSignUp = false;
  isLoggingIn = false;
  loginError = false;
  isSigningUp = false;
  signUpError = false;
  toastVisible = false;
  showMobileGreeting = false;

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
    if (this.isLoggingIn) return;

    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    this.isLoggingIn = true;
    this.loginError = false;

    this.authService.logIn(this.logInData.email, this.logInData.password)
    .subscribe({
      next: () => {
        this.isLoggingIn = false;
        this.handleLoginNavigation();
      },
      error: (err) => {
        console.error('Login failed', err);
        this.isLoggingIn = false;
        this.loginError = true;
      },
    });
  }

  guestLogin(): void {
    this.authService.guestLogIn().subscribe({
      next: () => {
        this.handleLoginNavigation();
      },
      error: (err) => {
        console.error('Guest login failed', err);
      },
    });
  }

  handleLoginNavigation(): void {
    if (this.isMobile) {
      this.showMobileGreeting = true;

      setTimeout(() => {
        this.showMobileGreeting = false;
        this.router.navigate(['/summary']);
      }, 2000);
    } else {
      this.router.navigate(['/summary']);
    }
  }

  onSignUp(form: NgForm): void {
    if (this.isSigningUp) return;

    if (form.invalid || this.signUpData.password !== this.confirmPassword) {
      form.control.markAllAsTouched();
      return;
    }

    this.isSigningUp = true;
    this.signUpError = false;

    this.authService.signUp(this.signUpData.name, this.signUpData.email, this.signUpData.password)
    .subscribe({
      next: () => {
        this.isSigningUp = false;

        this.confirmPassword = '';
        this.signUpData = {
          name: '',
          email: '',
          password: '',
        };

        this.showSignUp = false;
        this.showToast();
      },
      error: (err) => {
        console.error('Sign up failed', err);
        this.isSigningUp = false;
        this.signUpError = true;
      },
    });
  }

  showToast(): void {
    this.toastVisible = true; 

    setTimeout(() => {
      this.toastVisible = false; 
    }, 2500);
  }

  get greeting(): string {
    return getGreeting();
  }
} 
