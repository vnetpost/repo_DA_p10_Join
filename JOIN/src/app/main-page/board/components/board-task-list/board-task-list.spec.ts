import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardTaskList } from './board-task-list';

describe('BoardTaskList', () => {
  let component: BoardTaskList;
  let fixture: ComponentFixture<BoardTaskList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardTaskList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoardTaskList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
