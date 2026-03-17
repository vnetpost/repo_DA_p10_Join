import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTaskPriority } from './add-task-priority';

describe('AddTaskPriority', () => {
  let component: AddTaskPriority;
  let fixture: ComponentFixture<AddTaskPriority>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTaskPriority],
    }).compileComponents();

    fixture = TestBed.createComponent(AddTaskPriority);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
