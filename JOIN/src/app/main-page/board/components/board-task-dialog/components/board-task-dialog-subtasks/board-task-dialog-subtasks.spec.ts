import { TestBed } from '@angular/core/testing';

import { BoardTaskDialogSubtasks } from './board-task-dialog-subtasks';

describe('BoardTaskDialogSubtasks', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardTaskDialogSubtasks],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(BoardTaskDialogSubtasks);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
