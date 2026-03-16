import { TestBed } from '@angular/core/testing';

import { TaskDialogAttachmentService } from './task-dialog-attachment.service';

describe('TaskDialogAttachmentService', () => {
  let service: TaskDialogAttachmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskDialogAttachmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
