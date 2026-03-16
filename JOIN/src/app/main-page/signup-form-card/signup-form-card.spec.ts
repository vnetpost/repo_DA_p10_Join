import { TestBed } from '@angular/core/testing';

import { SignupFormCard } from './signup-form-card';

describe('SignupFormCard', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignupFormCard],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(SignupFormCard);
    const component = fixture.componentInstance;
    component.signUpData = { name: '', email: '', password: '' };
    expect(component).toBeTruthy();
  });
});
