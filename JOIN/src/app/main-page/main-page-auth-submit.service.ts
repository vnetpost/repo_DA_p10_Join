import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../shared/services/auth.service';
import { LoginFormData, SignupFormData } from '../shared/interfaces/auth-form-data';

/**
 * Coordinates auth form submissions for the main page.
 */
@Injectable({
  providedIn: 'root',
})
export class MainPageAuthSubmitService {
  private readonly authService = inject(AuthService);

  /**
   * Starts a login request using the current login form data.
   *
   * @param logInData Current login form values.
   * @returns Login observable.
   */
  submitLogin(logInData: LoginFormData): Observable<unknown> {
    return this.authService.logIn(logInData.email, logInData.password);
  }

  /**
   * Starts a guest login request.
   *
   * @returns Guest login observable.
   */
  submitGuestLogin(): Observable<unknown> {
    return this.authService.guestLogIn();
  }

  /**
   * Starts a sign-up request using the current sign-up form data.
   *
   * @param signUpData Current sign-up form values.
   * @returns Sign-up observable.
   */
  submitSignUp(signUpData: SignupFormData): Observable<unknown> {
    return this.authService.signUp(signUpData.name, signUpData.email, signUpData.password);
  }
}
