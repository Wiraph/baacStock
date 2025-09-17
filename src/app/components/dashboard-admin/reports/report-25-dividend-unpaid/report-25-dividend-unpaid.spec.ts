import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Report25DividendUnpaid } from './report-25-dividend-unpaid';

describe('Report25DividendUnpaid', () => {
  let component: Report25DividendUnpaid;
  let fixture: ComponentFixture<Report25DividendUnpaid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Report25DividendUnpaid]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Report25DividendUnpaid);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
