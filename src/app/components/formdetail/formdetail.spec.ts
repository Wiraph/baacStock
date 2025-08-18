import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Formdetail } from './formdetail';

describe('Formdetail', () => {
  let component: Formdetail;
  let fixture: ComponentFixture<Formdetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Formdetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Formdetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
