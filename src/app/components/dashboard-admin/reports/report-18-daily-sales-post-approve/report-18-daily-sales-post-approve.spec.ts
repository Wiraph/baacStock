import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Report18DailySalesPostApprove } from './report-18-daily-sales-post-approve';

describe('Report18DailySalesPostApprove', () => {
  let component: Report18DailySalesPostApprove;
  let fixture: ComponentFixture<Report18DailySalesPostApprove>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Report18DailySalesPostApprove]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Report18DailySalesPostApprove);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});