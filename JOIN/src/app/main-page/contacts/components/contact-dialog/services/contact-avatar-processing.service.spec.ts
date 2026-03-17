import { TestBed } from '@angular/core/testing';

import { ContactAvatarProcessingService } from './contact-avatar-processing.service';

describe('ContactAvatarProcessingService', () => {
  let service: ContactAvatarProcessingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContactAvatarProcessingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
