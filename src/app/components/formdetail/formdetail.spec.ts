import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleStockComponent } from './formdetail';

describe('SaleStockComponent', () => {
  let component: SaleStockComponent;
  let fixture: ComponentFixture<SaleStockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaleStockComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaleStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
