import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { TaskCategoryOption, TaskService } from '../../../shared/services/task-service';

@Component({
  selector: 'app-dropdown-category',
  imports: [],
  templateUrl: './dropdown-category.html',
  styleUrl: './dropdown-category.scss',
})
export class DropdownCategory {
  taskService = inject(TaskService);

  @Input() selectedCategory: TaskCategoryOption | null = null;
  @Output() selectedCategoryChange = new EventEmitter<TaskCategoryOption | null>();

  categoryDropdownOpen = false;

  get selectedCategoryLabel(): string {
    return this.selectedCategory?.label ?? '';
  }

  toggleCategoryDropdown(): void {
    this.categoryDropdownOpen = !this.categoryDropdownOpen;
  }

  selectCategory(category: TaskCategoryOption, event?: Event): void {
    event?.stopPropagation();
    this.selectedCategory = category;
    this.selectedCategoryChange.emit(category);
    this.categoryDropdownOpen = false;
  }
}
