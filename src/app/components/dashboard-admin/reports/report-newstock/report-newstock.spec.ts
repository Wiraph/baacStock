import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportNewstock } from './report-newstock';

describe('ReportNewstock', () => {
  let component: ReportNewstock;
  let fixture: ComponentFixture<ReportNewstock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportNewstock]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportNewstock);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
