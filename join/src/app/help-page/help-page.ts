import { Location } from '@angular/common';
import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-help-page',
  imports: [],
  templateUrl: './help-page.html',
  styleUrl: './help-page.scss',
})
export class HelpPage {
  location = inject(Location);

  back(): void {
    this.location.back();
  }
}
