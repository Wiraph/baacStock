import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Report32WhtCertByName } from './report-32-wht-cert-by-name';

describe('Report32WhtCertByName', () => {
  let component: Report32WhtCertByName;
  let fixture: ComponentFixture<Report32WhtCertByName>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Report32WhtCertByName]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Report32WhtCertByName);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
