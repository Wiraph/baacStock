import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportShareholderRatio } from './report-shareholder-ratio';

describe('ReportShareholderRatio', () => {
  let component: ReportShareholderRatio;
  let fixture: ComponentFixture<ReportShareholderRatio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportShareholderRatio]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportShareholderRatio);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
