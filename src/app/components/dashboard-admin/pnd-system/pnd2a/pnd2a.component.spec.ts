import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pnd2aComponent } from './pnd2a.component';

describe('Pnd2aold', () => {
  let component: Pnd2aComponent;
  let fixture: ComponentFixture<Pnd2aComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pnd2aComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Pnd2aComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
