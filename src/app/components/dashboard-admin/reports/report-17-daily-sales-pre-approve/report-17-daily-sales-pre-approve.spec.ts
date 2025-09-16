import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Report17DailySalesPreApprove } from './report-17-daily-sales-pre-approve';

describe('Report17DailySalesPreApprove', () => {
  let component: Report17DailySalesPreApprove;
  let fixture: ComponentFixture<Report17DailySalesPreApprove>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Report17DailySalesPreApprove]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Report17DailySalesPreApprove);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});