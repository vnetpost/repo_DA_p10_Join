import { TestBed } from '@angular/core/testing';

import { AddTaskSubmitService } from './add-task-submit.service';

describe('AddTaskSubmitService', () => {
  let service: AddTaskSubmitService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AddTaskSubmitService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
