import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Report19SalesNewOnly } from './report-19-sales-new-only';

describe('Report19SalesNewOnly', () => {
  let component: Report19SalesNewOnly;
  let fixture: ComponentFixture<Report19SalesNewOnly>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Report19SalesNewOnly]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Report19SalesNewOnly);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});