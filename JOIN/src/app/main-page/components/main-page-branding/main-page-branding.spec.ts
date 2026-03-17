import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainPageBranding } from './components/main-page-branding/main-page-branding';

describe('MainPageBranding', () => {
  let component: MainPageBranding;
  let fixture: ComponentFixture<MainPageBranding>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainPageBranding],
    }).compileComponents();

    fixture = TestBed.createComponent(MainPageBranding);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
