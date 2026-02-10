import { Component, HostListener, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { AsyncPipe } from '@angular/common';
import { getTwoInitials } from '../../utilities/utils';

@Component({
  selector: 'app-header',
  imports: [RouterLink, AsyncPipe],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
/**
 * Header component
 *
 * Represents the application header including navigation
 * and user menu interactions.
 * Manages menu state, keyboard interactions, and logout behavior.
 */
export class Header {
  loggedIn: boolean = true;
  menuOpen: boolean = false;
  authService = inject(AuthService);
  router = inject(Router);
  user$ = this.authService.user$;

  /**
   * Toggles the visibility of the navigation menu.
   *
   * @returns void
   */
  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  /**
   * Closes the navigation menu.
   *
   * @returns void
   */
  closeMenu(): void {
    this.menuOpen = false;
  }

  /**
   * Handles the Escape key interaction.
   *
   * Closes the navigation menu when the Escape key is pressed.
   *
   * @returns void
   */
  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeMenu();
  }

  /**
   * Handles the logout action.
   *
   * Closes the navigation menu and performs logout-related cleanup.
   *
   * @returns void
   */
  logout(): void {
    this.menuOpen = false;

    this.authService.logout().subscribe(() => {
      this.router.navigate(['/']);
    });
  }

  getLoggedInUserInitials(username: string | null): string {
    if (!username) return 'G';
    
    return getTwoInitials(username);
  }
}
