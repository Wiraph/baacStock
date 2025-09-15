import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Report7BalanceByType } from './report-balance-by-type';

describe('Report7BalanceByType', () => {
  let component: Report7BalanceByType;
  let fixture: ComponentFixture<Report7BalanceByType>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Report7BalanceByType]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Report7BalanceByType);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
