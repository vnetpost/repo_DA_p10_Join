import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTaskFormField } from './add-task-form-field';

describe('AddTaskFormField', () => {
  let component: AddTaskFormField;
  let fixture: ComponentFixture<AddTaskFormField>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTaskFormField],
    }).compileComponents();

    fixture = TestBed.createComponent(AddTaskFormField);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
