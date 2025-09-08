import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockType } from './stock-type';

describe('StockType', () => {
  let component: StockType;
  let fixture: ComponentFixture<StockType>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockType]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockType);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
