import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTaskA } from './add-task-a';

describe('AddTaskA', () => {
  let component: AddTaskA;
  let fixture: ComponentFixture<AddTaskA>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTaskA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddTaskA);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
