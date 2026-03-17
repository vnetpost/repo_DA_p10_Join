import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardTaskDialog } from './board-task-dialog';

describe('BoardTaskDialog', () => {
  let component: BoardTaskDialog;
  let fixture: ComponentFixture<BoardTaskDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardTaskDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoardTaskDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
