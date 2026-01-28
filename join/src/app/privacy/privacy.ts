import { Location } from '@angular/common';
import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-privacy',
  imports: [],
  templateUrl: './privacy.html',
  styleUrl: './privacy.scss',
})
/**
 * Privacy component
 *
 * Represents the privacy policy page of the application.
 * Provides navigation functionality to return to the
 * previous route.
 */
export class Privacy {
  location = inject(Location);

  /**
   * Navigates back to the previous page.
   *
   * Uses the Angular Location service to
   * return to the last route in history.
   *
   * @returns void
   */
  back(): void {
    this.location.back();
  }
}
