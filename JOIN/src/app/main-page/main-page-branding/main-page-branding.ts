import { Component, Input } from '@angular/core';

/**
 * Renders the animated landing-page branding and intro overlay.
 */
@Component({
  selector: 'app-main-page-branding',
  imports: [],
  templateUrl: './main-page-branding.html',
  styleUrl: './main-page-branding.scss',
})
export class MainPageBranding {
  @Input() logoMoving = false;
  @Input() introActive = false;
}
