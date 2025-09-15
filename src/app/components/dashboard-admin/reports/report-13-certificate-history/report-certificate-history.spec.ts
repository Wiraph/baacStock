import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Report13CertificateHistory } from './report-certificate-history';

describe('Report13CertificateHistory', () => {
  let component: Report13CertificateHistory;
  let fixture: ComponentFixture<Report13CertificateHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Report13CertificateHistory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Report13CertificateHistory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
