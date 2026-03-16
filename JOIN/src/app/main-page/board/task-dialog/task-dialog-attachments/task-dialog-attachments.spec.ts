import { TestBed } from '@angular/core/testing';

import { TaskDialogAttachments } from './task-dialog-attachments';

describe('TaskDialogAttachments', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskDialogAttachments],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(TaskDialogAttachments);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
