import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockTableDetailComponent } from './stock-table-detail';

describe('StockTableDetail', () => {
  let component: StockTableDetailComponent;
  let fixture: ComponentFixture<StockTableDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockTableDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockTableDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
