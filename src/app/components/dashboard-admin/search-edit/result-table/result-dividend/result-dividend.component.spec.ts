import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultDividendComponent } from './result-dividend.component';

describe('ResultDividendComponent', () => {
  let component: ResultDividendComponent;
  let fixture: ComponentFixture<ResultDividendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultDividendComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResultDividendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
