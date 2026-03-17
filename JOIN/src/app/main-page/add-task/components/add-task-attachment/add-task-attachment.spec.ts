import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTaskAttachment } from './add-task-attachment';

describe('AddTaskAttachment', () => {
  let component: AddTaskAttachment;
  let fixture: ComponentFixture<AddTaskAttachment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTaskAttachment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddTaskAttachment);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
