import { Component, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-cockpit',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './cockpit.html',
  styleUrl: './cockpit.scss',
})
export class Cockpit {
  loggedIn: boolean = true;

  isDesktop: boolean = window.innerWidth >= 1025;

  @HostListener('window:resize')
  onResize(): void {
    this.isDesktop = window.innerWidth >= 1025;
  }
}
