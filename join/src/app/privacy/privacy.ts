import { Location } from '@angular/common';
import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-privacy',
  imports: [],
  templateUrl: './privacy.html',
  styleUrl: './privacy.scss',
})
export class Privacy{
  location = inject(Location);

  back(): void {
    this.location.back();
  }
}
