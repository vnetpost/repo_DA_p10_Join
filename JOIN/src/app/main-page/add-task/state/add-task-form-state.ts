import { TaskCategoryOption } from '../../../shared/services/task.service';
import {
  ADD_TASK_TITLE_MAX_LENGTH,
  ADD_TASK_TITLE_MIN_LETTERS,
  isAddTaskTitleValid,
} from '../utils/add-task-validation.utils';

/**
 * Manages local validation and touch state for the add-task form.
 */
export class AddTaskFormState {
  isTitleTouched = false;
  isDueDateTouched = false;
  isCategoryTouched = false;

  readonly taskTitleMaxLength = ADD_TASK_TITLE_MAX_LENGTH;
  readonly taskTitleMinLetters = ADD_TASK_TITLE_MIN_LETTERS;

  /**
   * Indicates whether any title validation error should be shown.
   *
   * @param title Current task title input.
   * @returns `true` when the title has a visible error state.
   */
  showTitleError(title: string): boolean {
    return this.showTitleRequiredError(title) || this.showTitlePatternError(title);
  }

  /**
   * Indicates whether the required-title error should be shown.
   *
   * @param title Current task title input.
   * @returns `true` when the touched title is empty.
   */
  showTitleRequiredError(title: string): boolean {
    return this.isTitleTouched && !title.trim();
  }

  /**
   * Indicates whether the title violates pattern or letter-count requirements.
   *
   * @param title Current task title input.
   * @returns `true` when the title is touched and invalid.
   */
  showTitlePatternError(title: string): boolean {
    if (!this.isTitleTouched) return false;
    const trimmedTitle = title.trim();
    return trimmedTitle.length > 0 && !isAddTaskTitleValid(trimmedTitle);
  }

  /**
   * Builds the title validation message shown below the field.
   *
   * @param title Current task title input.
   * @returns The user-facing validation message.
   */
  titleErrorMessage(title: string): string {
    if (this.showTitleRequiredError(title)) return 'This field is required';
    return `Use up to ${this.taskTitleMaxLength} chars with at least ${this.taskTitleMinLetters} letters (a-z)`;
  }

  /**
   * Indicates whether the required due-date error should be shown.
   *
   * @param dueDate Current due-date input.
   * @returns `true` when the touched due-date field is empty.
   */
  showDueDateError(dueDate: string): boolean {
    return this.isDueDateTouched && !dueDate.trim();
  }

  /**
   * Indicates whether the required category error should be shown.
   *
   * @param activeCategory Current category selection.
   * @returns `true` when the category was touched but not selected.
   */
  showCategoryError(activeCategory: TaskCategoryOption | null): boolean {
    return this.isCategoryTouched && !activeCategory;
  }

  /**
   * Indicates whether all required form sections are currently valid.
   *
   * @param title Current task title input.
   * @param dueDate Current due-date input.
   * @param activeCategory Current category selection.
   * @returns `true` when all required values are valid.
   */
  isFormValid(title: string, dueDate: string, activeCategory: TaskCategoryOption | null): boolean {
    return (
      isAddTaskTitleValid(title) &&
      dueDate.trim().length > 0 &&
      Boolean(activeCategory)
    );
  }

  /**
   * Marks the invalid required sections as touched before submit.
   *
   * @param title Current task title input.
   * @param dueDate Current due-date input.
   * @param activeCategory Current category selection.
   * @returns void
   */
  markInvalidSections(title: string, dueDate: string, activeCategory: TaskCategoryOption | null): void {
    if (!isAddTaskTitleValid(title)) this.isTitleTouched = true;
    if (!dueDate) this.isDueDateTouched = true;
    if (!activeCategory?.value) this.isCategoryTouched = true;
  }

  /**
   * Resets all field touch markers to their initial state.
   *
   * @returns void
   */
  resetTouched(): void {
    this.isTitleTouched = false;
    this.isDueDateTouched = false;
    this.isCategoryTouched = false;
  }
}
