import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportBalanceByType } from './report-balance-by-type';

describe('ReportBalanceByType', () => {
  let component: ReportBalanceByType;
  let fixture: ComponentFixture<ReportBalanceByType>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportBalanceByType]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportBalanceByType);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
