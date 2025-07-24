import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultBlockCertificateComponent } from './result-block-certificate.component';

describe('ResultBlockCertificateComponent', () => {
  let component: ResultBlockCertificateComponent;
  let fixture: ComponentFixture<ResultBlockCertificateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultBlockCertificateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResultBlockCertificateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
}); 