import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Task } from '../../../shared/interfaces/task';

type PriorityOption = {
  value: Task['priority'];
  label: string;
  icon: string;
  modifierClass: string;
};

@Component({
  selector: 'app-priority-selector',
  imports: [],
  templateUrl: './priority-selector.html',
  styleUrl: './priority-selector.scss',
})
export class PrioritySelector {
  @Input() value: Task['priority'] = 'medium';
  @Output() valueChange = new EventEmitter<Task['priority']>();

  options: PriorityOption[] = [
    {
      value: 'high',
      label: 'Urgent',
      icon: 'assets/img/icons/priority/priority-high.svg',
      modifierClass: 'priority__button--urgent',
    },
    {
      value: 'medium',
      label: 'Medium',
      icon: 'assets/img/icons/priority/priority-medium.svg',
      modifierClass: 'priority__button--medium',
    },
    {
      value: 'low',
      label: 'Low',
      icon: 'assets/img/icons/priority/priority-low.svg',
      modifierClass: 'priority__button--low',
    },
  ];

  selectPriority(value: Task['priority']): void {
    this.value = value;
    this.valueChange.emit(value);
  }
}
