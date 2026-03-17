import { TestBed } from '@angular/core/testing';
import { ContactDialogSubmitService } from './contact-dialog-submit.service';

describe('ContactDialogSubmitService', () => {
  let service: ContactDialogSubmitService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContactDialogSubmitService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
