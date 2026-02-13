import { Component, inject } from '@angular/core';
import { RouterLink } from "@angular/router";
import { TaskService } from '../../shared/services/task-service';
import { AsyncPipe, DatePipe } from '@angular/common';
import { AuthService } from '../../shared/services/auth-service';
import { getGreeting } from '../../shared/utilities/utils';

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
    return getGreeting();
  }
}
