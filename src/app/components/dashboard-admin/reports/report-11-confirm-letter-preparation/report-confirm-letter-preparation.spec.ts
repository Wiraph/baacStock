import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Report11ConfirmLetterPreparation } from './report-confirm-letter-preparation';

describe('Report11ConfirmLetterPreparation', () => {
  let component: Report11ConfirmLetterPreparation;
  let fixture: ComponentFixture<Report11ConfirmLetterPreparation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Report11ConfirmLetterPreparation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Report11ConfirmLetterPreparation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
