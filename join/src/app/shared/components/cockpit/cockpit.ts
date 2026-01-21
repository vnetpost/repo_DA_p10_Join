import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-cockpit',
  imports: [RouterLink],
  templateUrl: './cockpit.html',
  styleUrl: './cockpit.scss',
})
export class Cockpit {
  loggedIn: boolean = true;
}
