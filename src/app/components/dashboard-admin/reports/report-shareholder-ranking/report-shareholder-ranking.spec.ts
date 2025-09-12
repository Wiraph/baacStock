import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportShareholderRanking } from './report-shareholder-ranking';

describe('ReportShareholderRanking', () => {
  let component: ReportShareholderRanking;
  let fixture: ComponentFixture<ReportShareholderRanking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportShareholderRanking]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportShareholderRanking);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
