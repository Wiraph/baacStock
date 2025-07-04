import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveItemComponent } from './approve-item';

describe('ApproveItem', () => {
  let component: ApproveItemComponent;
  let fixture: ComponentFixture<ApproveItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApproveItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApproveItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
