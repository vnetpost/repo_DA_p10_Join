import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-task-form-field',
  imports: [FormsModule],
  templateUrl: './task-form-field.html',
  styleUrl: './task-form-field.scss',
})
export class TaskFormField {
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();
  @Output() fieldBlur = new EventEmitter<void>();

  @Input() label = '';
  @Input() isRequired = false;
  @Input() hasError = false;
  @Input() placeholder = '';
  @Input() type = 'text';
  @Input() isTextarea = false;
  @Input() min: string | null = null;
  @Input() iconSrc: string | null = null;
}
