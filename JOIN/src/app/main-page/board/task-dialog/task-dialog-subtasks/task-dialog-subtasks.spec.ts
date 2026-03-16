import { TestBed } from '@angular/core/testing';

import { TaskDialogSubtasks } from './task-dialog-subtasks';

describe('TaskDialogSubtasks', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskDialogSubtasks],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(TaskDialogSubtasks);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
