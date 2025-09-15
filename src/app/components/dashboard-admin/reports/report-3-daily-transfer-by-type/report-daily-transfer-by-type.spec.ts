import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Report3DailyTransferByType } from './report-daily-transfer-by-type';

describe('Report3DailyTransferByType', () => {
  let component: Report3DailyTransferByType;
  let fixture: ComponentFixture<Report3DailyTransferByType>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Report3DailyTransferByType]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Report3DailyTransferByType);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
