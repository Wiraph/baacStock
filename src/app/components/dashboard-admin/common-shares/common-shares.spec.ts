import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonSharesComponent } from './common-shares';

describe('CommonShares', () => {
  let component: CommonSharesComponent;
  let fixture: ComponentFixture<CommonSharesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonSharesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommonSharesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
