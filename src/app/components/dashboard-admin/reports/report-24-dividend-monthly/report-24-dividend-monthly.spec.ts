import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Report24DividendMonthly } from './report-24-dividend-monthly';

describe('Report24DividendMonthly', () => {
  let component: Report24DividendMonthly;
  let fixture: ComponentFixture<Report24DividendMonthly>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Report24DividendMonthly]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Report24DividendMonthly);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
