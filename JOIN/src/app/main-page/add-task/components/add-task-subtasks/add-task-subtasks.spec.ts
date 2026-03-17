import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTaskSubtasks } from './add-task-subtasks';

describe('AddTaskSubtasks', () => {
  let component: AddTaskSubtasks;
  let fixture: ComponentFixture<AddTaskSubtasks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTaskSubtasks],
    }).compileComponents();

    fixture = TestBed.createComponent(AddTaskSubtasks);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
