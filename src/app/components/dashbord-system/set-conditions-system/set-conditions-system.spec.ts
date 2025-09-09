import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetConditionsSystemComponent } from './set-conditions-system';

describe('SetConditionsSystemComponent', () => {
  let component: SetConditionsSystemComponent;
  let fixture: ComponentFixture<SetConditionsSystemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetConditionsSystemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SetConditionsSystemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
