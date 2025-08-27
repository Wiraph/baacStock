import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewCusComponent } from './newcus';

describe('SaleStockComponent', () => {
  let component: NewCusComponent;
  let fixture: ComponentFixture<NewCusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewCusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewCusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
