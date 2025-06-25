import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonStockComponent } from './common-stock';

describe('CommonStock', () => {
  let component: CommonStockComponent;
  let fixture: ComponentFixture<CommonStockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonStockComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommonStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
