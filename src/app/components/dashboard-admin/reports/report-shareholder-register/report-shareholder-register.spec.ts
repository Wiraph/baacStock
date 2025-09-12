import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportShareholderRegister } from './report-shareholder-register';

describe('ReportShareholderRegister', () => {
  let component: ReportShareholderRegister;
  let fixture: ComponentFixture<ReportShareholderRegister>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportShareholderRegister]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportShareholderRegister);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
