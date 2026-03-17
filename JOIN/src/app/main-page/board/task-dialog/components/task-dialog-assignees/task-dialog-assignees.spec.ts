import { TestBed } from '@angular/core/testing';

import { TaskDialogAssignees } from './task-dialog-assignees';

describe('TaskDialogAssignees', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskDialogAssignees],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(TaskDialogAssignees);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
