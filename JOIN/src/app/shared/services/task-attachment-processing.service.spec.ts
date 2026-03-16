import { TestBed } from '@angular/core/testing';

import { TaskAttachmentProcessingService } from './task-attachment-processing.service';

describe('TaskAttachmentProcessingService', () => {
  let service: TaskAttachmentProcessingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskAttachmentProcessingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
