import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockCertificatesComponent } from './block-certificates.component';

describe('BlockCertificatesComponent', () => {
  let component: BlockCertificatesComponent;
  let fixture: ComponentFixture<BlockCertificatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlockCertificatesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlockCertificatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
}); 