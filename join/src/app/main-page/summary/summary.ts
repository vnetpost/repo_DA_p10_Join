import { Component, inject } from '@angular/core';
import { RouterLink } from "@angular/router";
import { TaskService } from '../../shared/services/task-service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-summary',
  imports: [RouterLink, DatePipe],
  templateUrl: './summary.html',
  styleUrl: './summary.scss',
})
export class Summary {
  taskService = inject(TaskService);
  loggedIn: boolean = true;

  get greeting(): string {
    const hour = new Date().getHours();
    const punctuation = this.loggedIn ? ',' : '!';

    if (hour >= 5 && hour < 12) {
      return `Good morning${punctuation}`;
    } else if (hour >= 12 && hour < 17) {
      return `Good day${punctuation}`;
    } else if (hour >= 17 && hour < 22) {
      return `Good evening${punctuation}`;
    } else {
      return `Good night${punctuation}`;
    }
  }
}
