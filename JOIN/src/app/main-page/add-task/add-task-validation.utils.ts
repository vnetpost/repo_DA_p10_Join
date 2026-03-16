import { Task } from '../../shared/interfaces/task';

/**
 * Shared validation constants for the add-task form.
 */
export const ADD_TASK_TITLE_MIN_LENGTH = 3;
export const ADD_TASK_TITLE_MAX_LENGTH = 100;
export const ADD_TASK_TITLE_MIN_LETTERS = 3;

/**
 * Validates a task title against length and minimum-letter rules.
 *
 * @param value Title candidate from the form.
 * @returns `true` if the title is valid.
 */
export function isAddTaskTitleValid(value: string): boolean {
  const title = value.trim();
  return (
    title.length >= ADD_TASK_TITLE_MIN_LENGTH &&
    title.length <= ADD_TASK_TITLE_MAX_LENGTH &&
    hasMinimumLetters(title, ADD_TASK_TITLE_MIN_LETTERS)
  );
}

/**
 * Validates required add-task form fields and returns the usable category.
 *
 * @param title Trimmed task title.
 * @param dueDateValue Raw due date input value.
 * @param category Selected category value.
 * @returns The validated category or `null` if validation failed.
 */
export function validateAddTaskForm(
  title: Task['title'],
  dueDateValue: string,
  category: Task['category'] | null
): Task['category'] | null {
  if (!isAddTaskTitleValid(title) || !dueDateValue || !category) return null;
  return category;
}

/**
 * Checks whether a value contains a minimum amount of latin letters.
 *
 * @param value Candidate input string.
 * @param minLetters Minimum amount of letters required.
 * @returns `true` when the minimum is met.
 */
function hasMinimumLetters(value: string, minLetters: number): boolean {
  const letterMatches = value.match(/[a-z]/gi);
  return (letterMatches?.length ?? 0) >= minLetters;
}
