import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Report15CertificateDeliveryEnvelope } from './report-15-certificate-delivery-envelope';

describe('Report15CertificateDeliveryEnvelope', () => {
  let component: Report15CertificateDeliveryEnvelope;
  let fixture: ComponentFixture<Report15CertificateDeliveryEnvelope>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Report15CertificateDeliveryEnvelope]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Report15CertificateDeliveryEnvelope);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
