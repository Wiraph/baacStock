import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetConditionsSystem } from './set-conditions-system';

describe('SetConditionsSystem', () => {
  let component: SetConditionsSystem;
  let fixture: ComponentFixture<SetConditionsSystem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetConditionsSystem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SetConditionsSystem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
