import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTaskB } from './add-task-b';

describe('AddTaskB', () => {
  let component: AddTaskB;
  let fixture: ComponentFixture<AddTaskB>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTaskB]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddTaskB);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
