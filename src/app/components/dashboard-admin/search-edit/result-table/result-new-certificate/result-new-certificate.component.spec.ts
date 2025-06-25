import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultNewCertificateComponent } from './result-new-certificate.component';

describe('ResultNewCertificateComponent', () => {
  let component: ResultNewCertificateComponent;
  let fixture: ComponentFixture<ResultNewCertificateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultNewCertificateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResultNewCertificateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
