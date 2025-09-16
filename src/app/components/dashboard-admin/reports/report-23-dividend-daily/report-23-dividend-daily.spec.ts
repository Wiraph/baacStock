import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Report23DividendDaily } from './report-23-dividend-daily';

describe('Report23DividendDaily', () => {
  let component: Report23DividendDaily;
  let fixture: ComponentFixture<Report23DividendDaily>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Report23DividendDaily]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Report23DividendDaily);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});