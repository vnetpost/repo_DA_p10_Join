import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TaskService } from '../../../shared/services/task.service';

@Component({
  selector: 'app-summary-metrics',
  imports: [RouterLink, DatePipe],
  templateUrl: './summary-metrics.html',
  styleUrl: './summary-metrics.scss',
})
export class SummaryMetrics {
  taskService = inject(TaskService);
}
