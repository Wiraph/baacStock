import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportCertificateHistory } from './report-certificate-history';

describe('ReportCertificateHistory', () => {
  let component: ReportCertificateHistory;
  let fixture: ComponentFixture<ReportCertificateHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportCertificateHistory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportCertificateHistory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
