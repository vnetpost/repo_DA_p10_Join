import {
  Component,
  EventEmitter,
  HostListener,
  ElementRef,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { TaskCategoryOption, TaskService } from '../../../../shared/services/task.service';

/**
 * Single-select dropdown used for choosing a task category.
 */
@Component({
  selector: 'app-dropdown-category',
  imports: [],
  templateUrl: './dropdown-category.html',
  styleUrl: './dropdown-category.scss',
})
export class DropdownCategory {
  private static nextDropdownId = 0;
  elementRef = inject(ElementRef);
  taskService = inject(TaskService);
  readonly dropdownId = `task-category-dropdown-${DropdownCategory.nextDropdownId++}`;

  /** Active category selection. */
  @Input() selectedCategory: TaskCategoryOption | null = null;
  /** Emits when a new category is selected. */
  @Output() selectedCategoryChange = new EventEmitter<TaskCategoryOption | null>();
  /** Visual error state passed from the parent form. */
  @Input() hasError = false;
  @Input() resetTrigger = 0;
  /** Emits blur-like events so parent can update touch state. */
  @Output() fieldBlur = new EventEmitter<void>();

  isDropdownOpen = false;

  /** Human-readable label of the selected category. */
  get selectedCategoryLabel(): string {
    return this.selectedCategory?.label ?? '';
  }

  /**
   * Resets the open state when the parent form triggers a full reset.
   *
   * @param changes The latest Angular input changes.
   * @returns void
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['resetTrigger']) return;
    this.isDropdownOpen = false;
  }

  /**
   * Toggles dropdown visibility and reports blur when closing.
   * @param event Optional trigger event used to stop propagation.
   */
  toggleDropdownOpen(event?: Event): void {
    event?.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
    if (!this.isDropdownOpen) {
      this.fieldBlur.emit();
    }
  }

  /**
   * Selects a category and closes the dropdown.
   * @param newCat Category selected by the user.
   * @param event Optional trigger event used to stop propagation.
   */
  selectCategory(newCat: TaskCategoryOption, event?: Event): void {
    event?.stopPropagation();
    this.selectedCategory = newCat;
    this.selectedCategoryChange.emit(newCat);
    this.isDropdownOpen = false;
    this.fieldBlur.emit();
  }

  /**
   * Closes the dropdown when interaction occurs outside the component.
   * @param event Pointer-down event from the document.
   */
  @HostListener('document:pointerdown', ['$event'])
  closeOnOutsidePointerDown(event: Event): void {
    if (!this.isDropdownOpen) return;
    const target = event.target;
    if (target && this.elementRef.nativeElement.contains(target)) return;
    this.isDropdownOpen = false;
    this.fieldBlur.emit();
  }
}
