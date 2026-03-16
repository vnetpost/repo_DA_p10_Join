import { TestBed } from '@angular/core/testing';

import { TaskAttachmentViewerService } from './task-attachment-viewer.service';

describe('TaskAttachmentViewerService', () => {
  let service: TaskAttachmentViewerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskAttachmentViewerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
