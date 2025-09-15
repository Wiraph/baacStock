import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Report10BalanceConfirmLetter } from './report-balance-confirm-letter';

describe('Report10BalanceConfirmLetter', () => {
  let component: Report10BalanceConfirmLetter;
  let fixture: ComponentFixture<Report10BalanceConfirmLetter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Report10BalanceConfirmLetter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Report10BalanceConfirmLetter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
