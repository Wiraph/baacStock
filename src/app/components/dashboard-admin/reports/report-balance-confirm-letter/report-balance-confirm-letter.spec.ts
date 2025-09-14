import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportBalanceConfirmLetter } from './report-balance-confirm-letter';

describe('ReportBalanceConfirmLetter', () => {
  let component: ReportBalanceConfirmLetter;
  let fixture: ComponentFixture<ReportBalanceConfirmLetter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportBalanceConfirmLetter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportBalanceConfirmLetter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
