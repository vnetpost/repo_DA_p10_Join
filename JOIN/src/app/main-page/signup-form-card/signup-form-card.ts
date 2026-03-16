import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SignUpFormData } from '../../shared/interfaces/login-form-data';

/**
 * Renders the sign-up form card on the auth page.
 */
@Component({
  selector: 'app-signup-form-card',
  imports: [FormsModule, RouterLink],
  templateUrl: './signup-form-card.html',
  styleUrl: './signup-form-card.scss',
})
export class SignupFormCard {
  @Input({ required: true }) signUpData!: SignUpFormData;
  @Input() confirmPassword = '';
  @Input() showSignUpPassword = false;
  @Input() showConfirmPassword = false;
  @Input() isSigningUp = false;
  @Input() signUpError = false;
  @Output() submitSignUp = new EventEmitter<NgForm>();
  @Output() closeSignUp = new EventEmitter<void>();
  @Output() toggleSignUpPassword = new EventEmitter<void>();
  @Output() toggleConfirmPassword = new EventEmitter<void>();
  @Output() confirmPasswordChange = new EventEmitter<string>();

  /**
   * Emits the submitted sign-up form.
   *
   * @param form Submitted Angular form instance.
   * @returns void
   */
  onSubmit(form: NgForm): void {
    this.submitSignUp.emit(form);
  }
}
