import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportConfirmLetterPreparation } from './report-confirm-letter-preparation';

describe('ReportConfirmLetterPreparation', () => {
  let component: ReportConfirmLetterPreparation;
  let fixture: ComponentFixture<ReportConfirmLetterPreparation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportConfirmLetterPreparation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportConfirmLetterPreparation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
