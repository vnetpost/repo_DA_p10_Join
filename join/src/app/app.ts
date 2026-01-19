import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './shared/components/header/header';
import { Cockpit } from './shared/components/cockpit/cockpit';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Cockpit],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('join');
}
