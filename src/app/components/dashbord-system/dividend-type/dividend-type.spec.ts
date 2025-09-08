import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DividendType } from './dividend-type';

describe('DividendType', () => {
  let component: DividendType;
  let fixture: ComponentFixture<DividendType>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DividendType]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DividendType);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
