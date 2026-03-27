import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Header } from './shared/components/header/header';
import { Cockpit } from './shared/components/cockpit/cockpit';

@Component({
  selector: 'app-root',
  imports: [Header, Cockpit, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly appShellRoutes = [
    '/summary',
    '/add-task',
    '/board',
    '/contacts',
    '/help',
    '/privacy',
    '/imprint',
  ];

  /**
   * Creates the root component with router access for layout route checks.
   *
   * @param router Angular router instance.
   */
  constructor(public router: Router) {}

  /**
   * Indicates whether the current route should render inside the app shell.
   *
   * @returns `true` for protected routes and legal pages with cockpit and header.
   */
  get useAppShell(): boolean {
    return this.appShellRoutes.some((route) => this.router.url.startsWith(route));
  }
}
