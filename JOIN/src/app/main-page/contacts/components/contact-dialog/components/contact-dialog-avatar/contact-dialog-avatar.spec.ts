import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContactDialogAvatar } from './contact-dialog-avatar';

describe('ContactDialogAvatar', () => {
  let component: ContactDialogAvatar;
  let fixture: ComponentFixture<ContactDialogAvatar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactDialogAvatar],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactDialogAvatar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
