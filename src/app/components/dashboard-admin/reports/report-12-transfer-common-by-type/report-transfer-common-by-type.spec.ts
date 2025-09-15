import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Report12TransferCommonByType } from './report-transfer-common-by-type';

describe('Report12TransferCommonByType', () => {
  let component: Report12TransferCommonByType;
  let fixture: ComponentFixture<Report12TransferCommonByType>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Report12TransferCommonByType]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Report12TransferCommonByType);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
