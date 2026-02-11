import { Component, ElementRef, EventEmitter, Input, Output, inject } from '@angular/core';
import { Subtask } from '../../../shared/interfaces/task';

/**
 * Handles subtask creation, inline editing and removal for the task form.
 */
@Component({
  selector: 'app-subtask-composer',
  imports: [],
  templateUrl: './subtask-composer.html',
  styleUrl: './subtask-composer.scss',
})
export class SubtaskComposer {
  private hostElement = inject(ElementRef<HTMLElement>);
  readonly subtaskTitleMinLength = 3;
  readonly subtaskTitleMaxLength = 100;
  private readonly subtaskTitleRegex = /^[A-Za-zÄÖÜäöüß0-9 .,:;!?()_/#+'&"@-]+$/;

  /** Current list of subtasks managed by the parent form. */
  @Input() subtasks: Subtask[] = [];
  /** Emits whenever the subtask list changes. */
  @Output() subtasksChange = new EventEmitter<Subtask[]>();

  subtaskTitle = '';
  editingIndex: number | null = null;

  /** Indicates whether the subtask input contains non-whitespace text. */
  get hasSubtaskInput(): boolean {
    return this.subtaskTitle.trim().length > 0;
  }

  /** Shows validation feedback for invalid subtask titles. */
  get showSubtaskPatternError(): boolean {
    const title = this.subtaskTitle.trim();
    return title.length > 0 && !this.isSubtaskTitleValid(title);
  }

  /**
   * Adds a new subtask or confirms edits for an existing one.
   * Ignores duplicates in create mode and invalid input.
   */
  addSubtask(): void {
    const newTitle = this.subtaskTitle.trim();
    if (!newTitle) return;
    if (!this.isSubtaskTitleValid(newTitle)) return;
    if (
      this.editingIndex === null &&
      this.subtasks.some((subtask) => subtask.title.trim().toLowerCase() === newTitle.toLowerCase())
    ) {
      return;
    }

    if (this.editingIndex !== null) {
      const updated = this.subtasks.map((subtask, index) =>
        index === this.editingIndex ? { ...subtask, title: newTitle } : subtask,
      );
      this.subtasks = updated;
      this.subtasksChange.emit(updated);
      this.editingIndex = null;
      this.subtaskTitle = '';
      return;
    }
    const updated = [...this.subtasks, { title: newTitle, done: false }];
    this.subtasks = updated;
    this.subtasksChange.emit(updated);
    this.subtaskTitle = '';
    this.scrollToLatestSubtask();
  }

  /**
   * Handles submit-by-enter behavior from the subtask input field.
   * @param event Keyboard-triggered submit event.
   */
  handleEnter(event: Event): void {
    if (!this.hasSubtaskInput) {
      return;
    }
    event.preventDefault();
    this.addSubtask();
  }

  /** Clears the current subtask input and cancels edit mode. */
  clearSubtaskTitle(): void {
    this.subtaskTitle = '';
    this.editingIndex = null;
  }

  /**
   * Loads a subtask title into the input for inline editing.
   * @param index Subtask index to edit.
   */
  startEditSubtask(index: number): void {
    const subtask = this.subtasks[index];
    if (!subtask) return;
    this.subtaskTitle = subtask.title;
    this.editingIndex = index;
  }

  /**
   * Removes a subtask and keeps edit mode index in sync.
   * @param index Subtask index to remove.
   */
  removeSubtask(index: number): void {
    const updated = this.subtasks.filter((_, subtaskIndex) => subtaskIndex !== index);
    this.subtasks = updated;
    this.subtasksChange.emit(updated);
    if (this.editingIndex === index) {
      this.editingIndex = null;
      this.subtaskTitle = '';
    } else if (this.editingIndex !== null && this.editingIndex > index) {
      this.editingIndex -= 1;
    }
  }

  /** Scrolls the newest subtask item into view after rendering. */
  private scrollToLatestSubtask(): void {
    requestAnimationFrame(() => {
      const host: HTMLElement = this.hostElement.nativeElement;
      const newestSubtask: HTMLElement | null = host.querySelector(
        '.subtask-list__item:last-child',
      );
      newestSubtask?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  }

  /**
   * Validates subtask title length and allowed characters.
   * @param value Subtask title candidate.
   * @returns `true` if the title is valid.
   */
  private isSubtaskTitleValid(value: string): boolean {
    return (
      value.length >= this.subtaskTitleMinLength &&
      value.length <= this.subtaskTitleMaxLength &&
      this.subtaskTitleRegex.test(value)
    );
  }
}
