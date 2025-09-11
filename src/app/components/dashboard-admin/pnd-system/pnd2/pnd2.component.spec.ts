import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pnd2Component } from './pnd2.component';

describe('Pnd2aold', () => {
  let component: Pnd2Component;
  let fixture: ComponentFixture<Pnd2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pnd2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Pnd2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
