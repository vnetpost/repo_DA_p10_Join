import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { LogInFormData, SignUpFormData } from '../shared/interfaces/login-form-data';
import { AuthService } from '../shared/services/auth.service';
import { AsyncPipe } from '@angular/common';
import { getGreeting } from '../shared/utilities/utils';
import { MainPageUiState } from './main-page-ui-state';
import { MainPageAuthSubmitService } from './main-page-auth-submit.service';
import { LoginFormCard } from './login-form-card/login-form-card';
import { SignupFormCard } from './signup-form-card/signup-form-card';

@Component({
  selector: 'app-main-page',
  imports: [RouterLink, FormsModule, AsyncPipe, LoginFormCard, SignupFormCard],
  templateUrl: './main-page.html',
  styleUrl: './main-page.scss',
})
/**
 * MainPage component
 *
 * Represents the application's entry page.
 * Handles user authentication flows including login,
 * guest login, and sign-up, as well as responsive behavior
 * and introductory animations.
 */
export class MainPage implements OnInit, OnDestroy {
  authService = inject(AuthService);
  router = inject(Router);
  private readonly mainPageAuthSubmitService = inject(MainPageAuthSubmitService);
  user$ = this.authService.user$;

  showSignUp: boolean = false;
  isLoggingIn: boolean = false;
  loginError: boolean = false;
  isSigningUp: boolean = false;
  signUpError: boolean = false;
  private readonly uiState = new MainPageUiState();
  private readonly resizeHandler = () => this.checkScreen();

  confirmPassword = '';
  showLogInPassword: boolean = false;
  showSignUpPassword: boolean = false;
  showConfirmPassword: boolean = false;

  logInData: LogInFormData = {
    email: '',
    password: '',
  };

  signUpData: SignUpFormData = {
    name: '',
    email: '',
    password: '',
  };

  get isMobile(): boolean {
    return this.uiState.isMobile;
  }

  get toastVisible(): boolean {
    return this.uiState.toastVisible;
  }

  get showMobileGreeting(): boolean {
    return this.uiState.showMobileGreeting;
  }

  get introActive(): boolean {
    return this.uiState.introActive;
  }

  get logoMoving(): boolean {
    return this.uiState.logoMoving;
  }

  /**
   * Initializes the component.
   *
   * Sets up responsive checks , evaluates navigation state,
   * and controls whether the intro animation is displayed.
   *
   * @returns void
   */
  ngOnInit(): void {
    this.checkScreen();
    const state = history.state;

    if (state?.openSignUp) {
      this.showSignUp = true;
    }

    this.uiState.applyIntroState(Boolean(state?.skipIntro));
    window.addEventListener('resize', this.resizeHandler);
  }

  /**
   * Clears listeners and timers on component teardown.
   *
   * @returns void
   */
  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeHandler);
    this.uiState.destroy();
  }

  /**
   * Checks the current screen size.
   *
   * Updates the mobile state based
   * on the viewport width.
   *
   * @returns void
   */
  checkScreen(): void {
    this.uiState.updateScreen(window.innerWidth);
  }

  /**
   * Plays the intro animation sequence.
   *
   * @returns void
   */
  showIntro(): void {
    this.uiState.startIntro();
  }

  /**
   * Opens the sign-up form.
   *
   * @returns void
   */
  openSignUp(): void {
    this.showSignUp = true;
  }

  /**
   * Closes the sign-up form.
   *
   * @returns void
   */
  closeSignUp(): void {
    this.showSignUp = false;
  }

  /**
   * Toggles visibility of the login password field.
   *
   * @returns void
   */
  toggleLogInPassword(): void {
    this.showLogInPassword = !this.showLogInPassword;
  }

  /**
   * Toggles visibility of the sign-up password field.
   *
   * @returns void
   */
  toggleSignUpPassword(): void {
    this.showSignUpPassword = !this.showSignUpPassword;
  }

  /**
   * Toggles visibility of the confirm-password field.
   *
   * @returns void
   */
  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  /**
   * Handles user login.
   *
   * Validates the form, triggers authentication,
   * and navigates after successful login.
   *
   * @param form The login form instance
   * @returns void
   */
  onLogin(form: NgForm): void {
    if (this.isLoggingIn) return;

    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    this.isLoggingIn = true;
    this.loginError = false;

    this.mainPageAuthSubmitService.submitLogin(this.logInData).subscribe({
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

  /**
   * Logs in the user as a guest.
   *
   * @returns void
   */
  guestLogin(): void {
    this.mainPageAuthSubmitService.submitGuestLogin().subscribe({
      next: () => {
        this.handleLoginNavigation();
      },
      error: (err) => {
        console.error('Guest login failed', err);
      },
    });
  }

  /**
   * Handles navigation after successful login.
   *
   * Displays a greeting on mobile devices
   * before redirecting to the summary page.
   *
   * @returns void
   */
  handleLoginNavigation(): void {
    this.uiState.handlePostLoginNavigation(() => {
      this.router.navigateByUrl('/summary', { replaceUrl: true });
    });
  }

  /**
   * Handles user sign-up.
   *
   * Validates the sign-up form, creates a new user account,
   * and triggers the corresponding success or error flow.
   *
   * @param form The sign-up form instance
   * @returns void
   */
  onSignUp(form: NgForm): void {
    if (this.isSigningUp) return;
    if (this.isSignUpFormInvalid(form)) return;

    this.isSigningUp = true;
    this.signUpError = false;

    this.mainPageAuthSubmitService.submitSignUp(this.signUpData).subscribe({
      next: () => {
        this.onSignUpSuccess();
      },
      error: (err) => {
        this.onSignUpError(err);
      },
    });
  }

  /**
   * Validates the sign-up form state.
   *
   * Marks all form fields as touched when validation fails.
   *
   * @param form The sign-up form instance
   * @returns True if the form is invalid
   */
  isSignUpFormInvalid(form: NgForm): boolean {
    if (form.invalid || this.signUpData.password !== this.confirmPassword) {
      form.control.markAllAsTouched();
      return true;
    }
    return false;
  }

  /**
   * Handles a successful sign-up.
   *
   * Resets form state, closes the sign-up view,
   * and displays a success notification.
   *
   * @returns void
   */
  onSignUpSuccess(): void {
    this.isSigningUp = false;
    this.confirmPassword = '';
    this.signUpData = {
      name: '',
      email: '',
      password: '',
    };
    this.showSignUp = false;
    this.showToast();
  }

  /**
   * Handles a sign-up error.
   *
   * Logs the error and updates the UI
   * to reflect the failed sign-up attempt.
   *
   * @param err The error returned during sign-up
   * @returns void
   */
  onSignUpError(err: unknown): void {
    console.error('Sign up failed', err);
    this.isSigningUp = false;
    this.signUpError = true;
  }

  /**
   * Displays a temporary success toast.
   *
   * @returns void
   */
  showToast(): void {
    this.uiState.showToast();
  }

  /**
   * Returns a contextual greeting message.
   *
   * @returns The greeting string
   */
  get greeting(): string {
    return getGreeting();
  }

  getGreetingName(userEmail: string | null | undefined): string {
    const email = userEmail?.trim().toLowerCase();
    const contact = this.authService.contactService.contacts.find(
      (item) => item.email?.trim().toLowerCase() === email,
    );
    return contact?.name ?? '';
  }
}
