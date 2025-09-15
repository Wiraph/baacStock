import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportTransferCommonByType } from './report-transfer-common-by-type';

describe('ReportTransferCommonByType', () => {
  let component: ReportTransferCommonByType;
  let fixture: ComponentFixture<ReportTransferCommonByType>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportTransferCommonByType]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportTransferCommonByType);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
