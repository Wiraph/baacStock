import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Reporttransfer } from './reporttransfer';

describe('Reporttransfer', () => {
  let component: Reporttransfer;
  let fixture: ComponentFixture<Reporttransfer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Reporttransfer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Reporttransfer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
