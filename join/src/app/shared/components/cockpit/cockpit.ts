import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from "@angular/router";

@Component({
  selector: 'app-cockpit',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './cockpit.html',
  styleUrl: './cockpit.scss',
})
export class Cockpit {
  loggedIn: boolean = true;
}
