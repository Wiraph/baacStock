import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Report27Pnd2a } from './report-27-pnd2a';

describe('Report27Pnd2a', () => {
  let component: Report27Pnd2a;
  let fixture: ComponentFixture<Report27Pnd2a>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Report27Pnd2a]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Report27Pnd2a);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
