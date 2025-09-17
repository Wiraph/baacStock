import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Report29DividendPaymentNotice } from './report-29-dividend-payment-notice';

describe('Report29DividendPaymentNotice', () => {
  let component: Report29DividendPaymentNotice;
  let fixture: ComponentFixture<Report29DividendPaymentNotice>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Report29DividendPaymentNotice]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Report29DividendPaymentNotice);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
