import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportCertificateDeliveryLetter } from './report-certificate-delivery-letter';

describe('ReportCertificateDeliveryLetter', () => {
  let component: ReportCertificateDeliveryLetter;
  let fixture: ComponentFixture<ReportCertificateDeliveryLetter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportCertificateDeliveryLetter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportCertificateDeliveryLetter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
