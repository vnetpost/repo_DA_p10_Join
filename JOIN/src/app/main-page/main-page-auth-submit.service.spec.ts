import { TestBed } from '@angular/core/testing';

import { MainPageAuthSubmitService } from './main-page-auth-submit.service';

describe('MainPageAuthSubmitService', () => {
  let service: MainPageAuthSubmitService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MainPageAuthSubmitService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
