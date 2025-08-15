import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnualdividendcalculatorComponent } from './annualdividendcalculator';

describe('Annualdividendcalculator', () => {
  let component: AnnualdividendcalculatorComponent;
  let fixture: ComponentFixture<AnnualdividendcalculatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnualdividendcalculatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnnualdividendcalculatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
