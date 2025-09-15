import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Report5ShareholderRatio } from './report-shareholder-ratio';

describe('Report5ShareholderRatio', () => {
  let component: Report5ShareholderRatio;
  let fixture: ComponentFixture<Report5ShareholderRatio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Report5ShareholderRatio]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Report5ShareholderRatio);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
