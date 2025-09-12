import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportDividendRate } from './report-dividend-rate';

describe('ReportDividendRate', () => {
  let component: ReportDividendRate;
  let fixture: ComponentFixture<ReportDividendRate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportDividendRate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportDividendRate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
