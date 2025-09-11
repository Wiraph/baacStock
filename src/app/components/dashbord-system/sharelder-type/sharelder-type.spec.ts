import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareholderTypeComponent } from './sharelder-type';

describe('SharelderType', () => {
  let component: ShareholderTypeComponent;
  let fixture: ComponentFixture<ShareholderTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShareholderTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShareholderTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
