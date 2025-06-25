import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferShareComponent } from './transfer-share.component';

describe('TransferShareComponent', () => {
  let component: TransferShareComponent;
  let fixture: ComponentFixture<TransferShareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransferShareComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransferShareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
