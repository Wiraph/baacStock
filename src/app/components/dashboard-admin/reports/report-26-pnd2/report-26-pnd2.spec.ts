import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Report26Pnd2 } from './report-26-pnd2';

describe('Report26Pnd2', () => {
  let component: Report26Pnd2;
  let fixture: ComponentFixture<Report26Pnd2>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Report26Pnd2]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Report26Pnd2);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
