import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { LoginFormData } from '../../../shared/interfaces/auth-form-data';

/**
 * Renders the log-in form card on the auth page.
 */
@Component({
  selector: 'app-login-form-card',
  imports: [FormsModule],
  templateUrl: './login-form-card.html',
  styleUrl: './login-form-card.scss',
})
export class LoginFormCard {
  @Input({ required: true }) logInData!: LoginFormData;
  @Input() showPassword = false;
  @Input() isLoggingIn = false;
  @Input() loginError = false;
  @Output() submitLogin = new EventEmitter<NgForm>();
  @Output() togglePassword = new EventEmitter<void>();
  @Output() guestLogin = new EventEmitter<void>();

  /**
   * Emits the submitted login form.
   *
   * @param form Submitted Angular form instance.
   * @returns void
   */
  onSubmit(form: NgForm): void {
    this.submitLogin.emit(form);
  }
}
