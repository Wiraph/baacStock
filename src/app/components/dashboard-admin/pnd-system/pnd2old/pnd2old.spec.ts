import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pnd2old } from './pnd2old';

describe('Pnd2old', () => {
  let component: Pnd2old;
  let fixture: ComponentFixture<Pnd2old>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pnd2old]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Pnd2old);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
