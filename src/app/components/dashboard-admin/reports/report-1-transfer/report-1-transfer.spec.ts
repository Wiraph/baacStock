import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Report1Transfer } from './report-1-transfer';

describe('Report1Transfer', () => {
  let component: Report1Transfer;
  let fixture: ComponentFixture<Report1Transfer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Report1Transfer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Report1Transfer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
