import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThaiCalendarComponent } from './thai-calendar-component';

describe('ThaiCalendarComponent', () => {
  let component: ThaiCalendarComponent;
  let fixture: ComponentFixture<ThaiCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThaiCalendarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThaiCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
