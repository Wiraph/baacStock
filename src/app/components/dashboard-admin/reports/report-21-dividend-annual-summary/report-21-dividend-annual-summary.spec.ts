import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Report21DividendAnnualSummary } from './report-21-dividend-annual-summary';

describe('Report21DividendAnnualSummary', () => {
  let component: Report21DividendAnnualSummary;
  let fixture: ComponentFixture<Report21DividendAnnualSummary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Report21DividendAnnualSummary]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Report21DividendAnnualSummary);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});