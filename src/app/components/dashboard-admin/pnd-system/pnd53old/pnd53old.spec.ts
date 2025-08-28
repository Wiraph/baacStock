import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pnd53old } from './pnd53old';

describe('Pnd53old', () => {
  let component: Pnd53old;
  let fixture: ComponentFixture<Pnd53old>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pnd53old]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Pnd53old);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
