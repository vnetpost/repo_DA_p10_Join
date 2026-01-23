import { Location } from '@angular/common';
import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-imprint',
  imports: [],
  templateUrl: './imprint.html',
  styleUrl: './imprint.scss',
})
export class Imprint{
  location = inject(Location);

  back(): void {
    this.location.back();
  }
}
