import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveIssue } from './approve-issue';

describe('ApproveIssue', () => {
  let component: ApproveIssue;
  let fixture: ComponentFixture<ApproveIssue>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApproveIssue]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApproveIssue);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
