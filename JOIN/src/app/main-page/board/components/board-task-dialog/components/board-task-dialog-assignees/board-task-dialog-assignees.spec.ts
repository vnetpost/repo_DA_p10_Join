import { TestBed } from '@angular/core/testing';

import { BoardTaskDialogAssignees } from './board-task-dialog-assignees';

describe('BoardTaskDialogAssignees', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardTaskDialogAssignees],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(BoardTaskDialogAssignees);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
