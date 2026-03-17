import { TestBed } from '@angular/core/testing';

import { ContactDetailProfile } from './contact-detail-profile';

describe('ContactDetailProfile', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactDetailProfile],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ContactDetailProfile);
    const component = fixture.componentInstance;
    component.contact = {
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      phone: '',
      isAvailable: true,
    };
    expect(component).toBeTruthy();
  });
});
