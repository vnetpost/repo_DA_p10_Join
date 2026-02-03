import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Task } from '../../../shared/interfaces/task';

type PriorityOption = {
  value: Task['priority'];
  label: string;
  iconPath: string;
  modifierClass: string;
};

@Component({
  selector: 'app-priority-selector',
  imports: [],
  templateUrl: './priority-selector.html',
  styleUrl: './priority-selector.scss',
})
export class PrioritySelector {
  @Input() selectedPriority: Task['priority'] = 'medium';
  @Output() selectedPriorityChange = new EventEmitter<Task['priority']>();

  options: PriorityOption[] = [
    {
      value: 'high',
      label: 'Urgent',
      iconPath: 'assets/img/icons/priority/priority-high.svg',
      modifierClass: 'priority__button--urgent',
    },
    {
      value: 'medium',
      label: 'Medium',
      iconPath: 'assets/img/icons/priority/priority-medium.svg',
      modifierClass: 'priority__button--medium',
    },
    {
      value: 'low',
      label: 'Low',
      iconPath: 'assets/img/icons/priority/priority-low.svg',
      modifierClass: 'priority__button--low',
    },
  ];

  selectPriority(newPrio: Task['priority']): void {
    this.selectedPriority = newPrio;
    this.selectedPriorityChange.emit(newPrio);
  }
}
