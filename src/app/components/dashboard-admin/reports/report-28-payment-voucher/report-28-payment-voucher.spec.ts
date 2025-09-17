import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Report28PaymentVoucher } from './report-28-payment-voucher';

describe('Report28PaymentVoucher', () => {
  let component: Report28PaymentVoucher;
  let fixture: ComponentFixture<Report28PaymentVoucher>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Report28PaymentVoucher]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Report28PaymentVoucher);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
