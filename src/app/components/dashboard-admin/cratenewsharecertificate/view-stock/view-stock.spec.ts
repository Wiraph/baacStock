import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewStock } from './view-stock';

describe('ViewStock', () => {
  let component: ViewStock;
  let fixture: ComponentFixture<ViewStock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewStock]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewStock);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
