import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PndComponent } from './pnd';

describe('Pnd', () => {
  let component: PndComponent;
  let fixture: ComponentFixture<PndComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PndComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PndComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
