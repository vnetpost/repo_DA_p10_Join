import { Component, inject, OnInit } from '@angular/core';
import { FirebaseService } from '../shared/services/firebase-service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { LogInFormData, SignUpFormData } from '../shared/interfaces/login-form-data';
import { AuthService } from '../shared/services/auth-service';

@Component({
  selector: 'app-main-page',
  imports: [RouterLink, FormsModule],
  templateUrl: './main-page.html',
  styleUrl: './main-page.scss',
})
export class MainPage implements OnInit {
  firebaseService = inject(FirebaseService);
  router = inject(Router);
  authService = inject(AuthService);
  user$ = this.authService.user$;

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

    this.authService.logIn(this.logInData.email, this.logInData.password)
    .subscribe({
      next: () => {
        this.router.navigate(['/summary']);
      },
      error: (err) => {
        console.error('Login failed', err);
      },
    });

    console.log('Login:', this.logInData);
  }

  guestLogin(): void {
    this.authService.guestLogIn().subscribe({
      next: () => {
        this.router.navigate(['/summary']);
      },
      error: (err) => {
        console.error('Guest login failed', err);
      },
    });
    
    console.log('Guest Login');
  }

  onSignUp(form: NgForm): void {
    if (form.invalid || this.signUpData.password !== this.confirmPassword) {
      return;
    }

    this.authService.signUp(this.signUpData.name, this.signUpData.email, this.signUpData.password)
    .subscribe({
      next: () => {
        this.router.navigate(['/summary']);
      },
      error: (err) => {
        console.error('Sign up failed', err);
      },
    });

    console.log('Sign up:', this.signUpData);
  }
}
