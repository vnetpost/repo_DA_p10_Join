
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactDetail } from './contact-detail';

describe('ContactDetail', () => {
  let component: ContactDetail;
  let fixture: ComponentFixture<ContactDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
