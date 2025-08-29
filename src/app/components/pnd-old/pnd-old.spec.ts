import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PndOld } from './pnd-old';

describe('PndOld', () => {
  let component: PndOld;
  let fixture: ComponentFixture<PndOld>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PndOld]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PndOld);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
