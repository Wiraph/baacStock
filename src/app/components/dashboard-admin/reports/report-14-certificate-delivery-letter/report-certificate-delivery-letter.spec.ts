import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Report14CertificateDeliveryLetter } from './report-certificate-delivery-letter';

describe('Report14CertificateDeliveryLetter', () => {
  let component: Report14CertificateDeliveryLetter;
  let fixture: ComponentFixture<Report14CertificateDeliveryLetter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Report14CertificateDeliveryLetter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Report14CertificateDeliveryLetter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
