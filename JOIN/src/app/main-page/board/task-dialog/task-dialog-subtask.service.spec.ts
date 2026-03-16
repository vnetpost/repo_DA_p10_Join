import { TestBed } from '@angular/core/testing';

import { TaskDialogSubtaskService } from './task-dialog-subtask.service';

describe('TaskDialogSubtaskService', () => {
  let service: TaskDialogSubtaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskDialogSubtaskService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
