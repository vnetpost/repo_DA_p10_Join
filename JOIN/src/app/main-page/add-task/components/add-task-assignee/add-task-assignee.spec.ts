import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTaskAssignee } from './add-task-assignee';
import { FirebaseService } from '../../../../shared/services/firebase.service';

describe('AddTaskAssignee', () => {
  let component: AddTaskAssignee;
  let fixture: ComponentFixture<AddTaskAssignee>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTaskAssignee],
      providers: [
        {
          provide: FirebaseService,
          useValue: {
            contacts: [],
            loading: false,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddTaskAssignee);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
