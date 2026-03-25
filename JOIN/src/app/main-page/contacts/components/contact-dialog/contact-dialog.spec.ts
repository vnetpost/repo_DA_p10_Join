import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContactDialog } from './contact-dialog';

describe('ContactDialog', () => {
  let component: ContactDialog;
  let fixture: ComponentFixture<ContactDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should keep the submit button disabled while the contact form is invalid', () => {
    const submitButton: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');

    expect(component.contactForm.invalid).toBeTrue();
    expect(submitButton.disabled).toBeTrue();
  });
});
