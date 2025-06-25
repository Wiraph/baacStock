import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CratenewsharecertificateComponent } from './cratenewsharecertificate';

describe('Cratenewsharecertificate', () => {
  let component: CratenewsharecertificateComponent;
  let fixture: ComponentFixture<CratenewsharecertificateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CratenewsharecertificateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CratenewsharecertificateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
