import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SapInterface } from './sap-interface';

describe('SapInterface', () => {
  let component: SapInterface;
  let fixture: ComponentFixture<SapInterface>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SapInterface]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SapInterface);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
