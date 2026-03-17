import { TestBed } from '@angular/core/testing';

import { LoginFormCard } from './components/login-form-card/login-form-card';

describe('LoginFormCard', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginFormCard],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(LoginFormCard);
    const component = fixture.componentInstance;
    component.logInData = { email: '', password: '' };
    expect(component).toBeTruthy();
  });
});
