import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTaskCategory } from './add-task-category';
import { TaskService } from '../../../../shared/services/task.service';

describe('AddTaskCategory', () => {
  let component: AddTaskCategory;
  let fixture: ComponentFixture<AddTaskCategory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTaskCategory],
      providers: [
        {
          provide: TaskService,
          useValue: {
            taskCategories: [],
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddTaskCategory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
