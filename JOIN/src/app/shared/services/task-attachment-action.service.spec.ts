import { TestBed } from '@angular/core/testing';

import { TaskAttachmentActionService } from './task-attachment-action.service';

describe('TaskAttachmentActionService', () => {
  let service: TaskAttachmentActionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskAttachmentActionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
