import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Report30DividendNoticeTaxCert } from './report-30-dividend-notice-tax-cert';

describe('Report30DividendNoticeTaxCert', () => {
  let component: Report30DividendNoticeTaxCert;
  let fixture: ComponentFixture<Report30DividendNoticeTaxCert>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Report30DividendNoticeTaxCert]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Report30DividendNoticeTaxCert);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
