import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultTranferShareComponent } from './result-tranfer-share.component';

describe('ResultTranferShareComponent', () => {
  let component: ResultTranferShareComponent;
  let fixture: ComponentFixture<ResultTranferShareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultTranferShareComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResultTranferShareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
