import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Report20DividendUnpaidNotice } from './report-20-dividend-unpaid-notice';

describe('Report20DividendUnpaidNotice', () => {
  let component: Report20DividendUnpaidNotice;
  let fixture: ComponentFixture<Report20DividendUnpaidNotice>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Report20DividendUnpaidNotice]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Report20DividendUnpaidNotice);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});