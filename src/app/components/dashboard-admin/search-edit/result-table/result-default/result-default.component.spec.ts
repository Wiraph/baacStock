import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultDefaultComponent } from './result-default.component';

describe('ResultDefaultComponent', () => {
  let component: ResultDefaultComponent;
  let fixture: ComponentFixture<ResultDefaultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultDefaultComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResultDefaultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
