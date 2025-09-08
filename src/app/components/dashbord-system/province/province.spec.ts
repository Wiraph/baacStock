import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Province } from './province';

describe('Province', () => {
  let component: Province;
  let fixture: ComponentFixture<Province>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Province]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Province);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
