import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveTransfer } from './approve-transfer';

describe('ApproveTransfer', () => {
  let component: ApproveTransfer;
  let fixture: ComponentFixture<ApproveTransfer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApproveTransfer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApproveTransfer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
