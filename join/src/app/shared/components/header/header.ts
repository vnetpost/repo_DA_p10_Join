import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  loggedIn: boolean = true;
  menuOpen: boolean = false;

  toggleMenu(){
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void{
    this.menuOpen = false;
  }

  logout(): void{
    this.menuOpen = false;
    // hier später Logik für Log-out rein
  }
}
