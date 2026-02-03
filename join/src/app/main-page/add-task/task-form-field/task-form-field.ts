import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-task-form-field',
  imports: [],
  templateUrl: './task-form-field.html',
  styleUrl: './task-form-field.scss',
})
export class TaskFormField {
  @Input() label = '';
  @Input() isRequired = false;
  @Input() placeholder = '';
  @Input() type = 'text';
  @Input() isTextarea = false;
  @Input() iconSrc: string | null = null;
  @Input() isDarkPlaceholder = false;
}
