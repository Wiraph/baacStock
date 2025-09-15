import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Report8ShareholderRegister } from './report-shareholder-register';

describe('Report8ShareholderRegister', () => {
  let component: Report8ShareholderRegister;
  let fixture: ComponentFixture<Report8ShareholderRegister>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Report8ShareholderRegister]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Report8ShareholderRegister);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
