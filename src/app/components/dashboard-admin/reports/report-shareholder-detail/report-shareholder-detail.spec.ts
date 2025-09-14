import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportShareholderDetail } from './report-shareholder-detail';

describe('ReportShareholderDetail', () => {
  let component: ReportShareholderDetail;
  let fixture: ComponentFixture<ReportShareholderDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportShareholderDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportShareholderDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
