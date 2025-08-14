import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupDetail } from './popup-detail';

describe('PopupDetail', () => {
  let component: PopupDetail;
  let fixture: ComponentFixture<PopupDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
