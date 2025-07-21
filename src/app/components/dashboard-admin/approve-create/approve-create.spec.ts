import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveCreate } from './approve-create';

describe('ApproveCreate', () => {
  let component: ApproveCreate;
  let fixture: ComponentFixture<ApproveCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApproveCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApproveCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
