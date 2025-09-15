import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Report9ShareholderDetail } from './report-shareholder-detail';

describe('Report9ShareholderDetail', () => {
  let component: Report9ShareholderDetail;
  let fixture: ComponentFixture<Report9ShareholderDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Report9ShareholderDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Report9ShareholderDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
