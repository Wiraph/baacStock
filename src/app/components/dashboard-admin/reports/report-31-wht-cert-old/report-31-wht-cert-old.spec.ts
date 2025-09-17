import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Report31WhtCertOld } from './report-31-wht-cert-old';

describe('Report31WhtCertOld', () => {
  let component: Report31WhtCertOld;
  let fixture: ComponentFixture<Report31WhtCertOld>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Report31WhtCertOld]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Report31WhtCertOld);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
