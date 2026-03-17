import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AuthService } from '../../../shared/services/auth.service';
import { getGreeting } from '../../../shared/utilities/utils';

/**
 * Renders the temporary mobile greeting overlay shown after login.
 */
@Component({
  selector: 'app-main-page-mobile-greeting',
  imports: [AsyncPipe],
  templateUrl: './main-page-mobile-greeting.html',
  styleUrl: './main-page-mobile-greeting.scss',
})
export class MainPageMobileGreeting {
  private readonly authService = inject(AuthService);
  readonly user$ = this.authService.user$;

  /**
   * Returns the contextual greeting shown in the overlay.
   *
   * @returns The greeting string.
   */
  get greeting(): string {
    return getGreeting();
  }

  /**
   * Resolves the display name that belongs to the authenticated email address.
   *
   * @param userEmail The email address of the active user.
   * @returns The matching contact name or an empty string when none is found.
   */
  getGreetingName(userEmail: string | null | undefined): string {
    const email = userEmail?.trim().toLowerCase();
    const contact = this.authService.contactService.contacts.find(
      (item) => item.email?.trim().toLowerCase() === email,
    );
    return contact?.name ?? '';
  }
}
