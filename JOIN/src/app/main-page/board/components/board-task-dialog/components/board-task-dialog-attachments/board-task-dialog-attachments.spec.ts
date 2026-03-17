import { TestBed } from '@angular/core/testing';

import { BoardTaskDialogAttachments } from './board-task-dialog-attachments';

describe('BoardTaskDialogAttachments', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardTaskDialogAttachments],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(BoardTaskDialogAttachments);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
