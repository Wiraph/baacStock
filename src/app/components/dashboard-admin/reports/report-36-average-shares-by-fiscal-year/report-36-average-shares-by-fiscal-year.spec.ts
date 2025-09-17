import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Report36AverageSharesByFiscalYear } from './report-36-average-shares-by-fiscal-year';

describe('Report36AverageSharesByFiscalYear', () => {
  let component: Report36AverageSharesByFiscalYear;
  let fixture: ComponentFixture<Report36AverageSharesByFiscalYear>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Report36AverageSharesByFiscalYear]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Report36AverageSharesByFiscalYear);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
