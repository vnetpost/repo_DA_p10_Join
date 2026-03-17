import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContactDialogFormFields } from './contact-dialog-form-fields';

describe('ContactDialogFormFields', () => {
  let component: ContactDialogFormFields;
  let fixture: ComponentFixture<ContactDialogFormFields>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactDialogFormFields],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactDialogFormFields);
    component = fixture.componentInstance;
    component.contactData = {
      name: '',
      email: '',
      phone: '',
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
