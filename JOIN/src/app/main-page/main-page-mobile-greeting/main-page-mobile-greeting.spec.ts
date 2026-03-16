import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainPageMobileGreeting } from './main-page-mobile-greeting';

describe('MainPageMobileGreeting', () => {
  let component: MainPageMobileGreeting;
  let fixture: ComponentFixture<MainPageMobileGreeting>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainPageMobileGreeting],
    }).compileComponents();

    fixture = TestBed.createComponent(MainPageMobileGreeting);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
