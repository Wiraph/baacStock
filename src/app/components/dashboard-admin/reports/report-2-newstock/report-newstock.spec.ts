import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Report2Newstock } from './report-newstock';

describe('Report2Newstock', () => {
  let component: Report2Newstock;
  let fixture: ComponentFixture<Report2Newstock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Report2Newstock]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Report2Newstock);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
