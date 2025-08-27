import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintCertificatesComponent } from './print-certificates.component';

describe('PrintCertificatesComponent', () => {
  let component: PrintCertificatesComponent;
  let fixture: ComponentFixture<PrintCertificatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrintCertificatesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrintCertificatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
