import {
  Component,
  EventEmitter,
  HostListener,
  ElementRef,
  Input,
  Output,
  inject,
} from '@angular/core';
import { TaskCategoryOption, TaskService } from '../../../shared/services/task-service';

@Component({
  selector: 'app-dropdown-category',
  imports: [],
  templateUrl: './dropdown-category.html',
  styleUrl: './dropdown-category.scss',
})
export class DropdownCategory {
  elementRef = inject(ElementRef);
  taskService = inject(TaskService);

  @Input() selectedCategory: TaskCategoryOption | null = null;
  @Output() selectedCategoryChange = new EventEmitter<TaskCategoryOption | null>();
  @Input() hasError = false;
  @Output() fieldBlur = new EventEmitter<void>();

  isDropdownOpen = false;

  get selectedCategoryLabel(): string {
    return this.selectedCategory?.label ?? '';
  }

  toggleDropdownOpen(event?: Event): void {
    event?.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
    if (!this.isDropdownOpen) {
      this.fieldBlur.emit();
    }
  }

  selectCategory(newCat: TaskCategoryOption, event?: Event): void {
    event?.stopPropagation();
    this.selectedCategory = newCat;
    this.selectedCategoryChange.emit(newCat);
    this.isDropdownOpen = false;
    this.fieldBlur.emit();
  }

  @HostListener('document:click', ['$event'])
  closeOnOutsideClick(event: MouseEvent): void {
    if (!this.isDropdownOpen) return;
    const target = event.target;
    if (target && this.elementRef.nativeElement.contains(target)) return;
    this.isDropdownOpen = false;
    this.fieldBlur.emit();
  }
}
