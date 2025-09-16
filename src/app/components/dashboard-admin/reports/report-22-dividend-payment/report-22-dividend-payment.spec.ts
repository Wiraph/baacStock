import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Report22DividendPayment } from './report-22-dividend-payment';

describe('Report22DividendPayment', () => {
  let component: Report22DividendPayment;
  let fixture: ComponentFixture<Report22DividendPayment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Report22DividendPayment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Report22DividendPayment);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});