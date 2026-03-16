import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SummaryMetrics } from './summary-metrics';

describe('SummaryMetrics', () => {
  let component: SummaryMetrics;
  let fixture: ComponentFixture<SummaryMetrics>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SummaryMetrics],
    }).compileComponents();

    fixture = TestBed.createComponent(SummaryMetrics);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
