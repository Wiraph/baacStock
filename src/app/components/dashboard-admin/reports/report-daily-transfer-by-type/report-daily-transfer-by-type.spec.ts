import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportDailyTransferByType } from './report-daily-transfer-by-type';

describe('ReportDailyTransferByType', () => {
  let component: ReportDailyTransferByType;
  let fixture: ComponentFixture<ReportDailyTransferByType>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportDailyTransferByType]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportDailyTransferByType);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
