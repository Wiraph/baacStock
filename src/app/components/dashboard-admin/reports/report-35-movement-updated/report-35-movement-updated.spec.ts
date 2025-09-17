import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Report35MovementUpdated } from './report-35-movement-updated';

describe('Report35MovementUpdated', () => {
  let component: Report35MovementUpdated;
  let fixture: ComponentFixture<Report35MovementUpdated>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Report35MovementUpdated]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Report35MovementUpdated);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
