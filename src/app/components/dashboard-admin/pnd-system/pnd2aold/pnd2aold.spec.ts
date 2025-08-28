import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pnd2aold } from './pnd2aold';

describe('Pnd2aold', () => {
  let component: Pnd2aold;
  let fixture: ComponentFixture<Pnd2aold>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pnd2aold]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Pnd2aold);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
