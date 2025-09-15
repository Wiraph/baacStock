import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Report4DividendRate } from './report-dividend-rate';

describe('Report4DividendRate', () => {
  let component: Report4DividendRate;
  let fixture: ComponentFixture<Report4DividendRate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Report4DividendRate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Report4DividendRate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
