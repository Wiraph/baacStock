import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Report34Movement } from './report-34-movement';

describe('Report34Movement', () => {
  let component: Report34Movement;
  let fixture: ComponentFixture<Report34Movement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Report34Movement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Report34Movement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
