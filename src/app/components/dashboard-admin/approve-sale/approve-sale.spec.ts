import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveSale } from './approve-sale';

describe('ApproveSale', () => {
  let component: ApproveSale;
  let fixture: ComponentFixture<ApproveSale>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApproveSale]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApproveSale);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
