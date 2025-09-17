import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Report33WhtCert } from './report-33-wht-cert';

describe('Report33WhtCert', () => {
  let component: Report33WhtCert;
  let fixture: ComponentFixture<Report33WhtCert>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Report33WhtCert]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Report33WhtCert);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
