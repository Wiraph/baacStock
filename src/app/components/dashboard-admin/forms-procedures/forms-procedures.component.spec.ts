import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormsProceduresComponent } from './forms-procedures.component';

describe('FormsProceduresComponent', () => {
  let component: FormsProceduresComponent;
  let fixture: ComponentFixture<FormsProceduresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsProceduresComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormsProceduresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
