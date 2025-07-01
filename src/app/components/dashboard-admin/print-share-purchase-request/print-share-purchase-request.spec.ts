import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintSharePurchaseRequestComponent } from './print-share-purchase-request';

describe('PrintSharePurchaseRequest', () => {
  let component: PrintSharePurchaseRequestComponent;
  let fixture: ComponentFixture<PrintSharePurchaseRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrintSharePurchaseRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrintSharePurchaseRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
