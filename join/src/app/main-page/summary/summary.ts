import { Component, inject } from '@angular/core';
import { RouterLink } from "@angular/router";
import { TaskService } from '../../shared/services/task-service';
import { AsyncPipe, DatePipe } from '@angular/common';
import { AuthService } from '../../shared/services/auth-service';

@Component({
  selector: 'app-summary',
  imports: [RouterLink, DatePipe, AsyncPipe],
  templateUrl: './summary.html',
  styleUrl: './summary.scss',
})
export class Summary {
  taskService = inject(TaskService);
  authService = inject(AuthService);
  user$ = this.authService.user$;

  get greeting(): string {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      return 'Good morning';
    } else if (hour >= 12 && hour < 17) {
      return 'Good day';
    } else if (hour >= 17 && hour < 22) {
      return 'Good evening';
    } else {
      return 'Good night';
    }
  }
}
