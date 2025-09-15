import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Report6ShareholderRanking } from './report-shareholder-ranking';

describe('Report6ShareholderRanking', () => {
  let component: Report6ShareholderRanking;
  let fixture: ComponentFixture<Report6ShareholderRanking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Report6ShareholderRanking]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Report6ShareholderRanking);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
