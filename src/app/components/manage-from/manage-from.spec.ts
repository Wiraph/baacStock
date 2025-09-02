import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageFrom } from './manage-from';

describe('ManageFrom', () => {
  let component: ManageFrom;
  let fixture: ComponentFixture<ManageFrom>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageFrom]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageFrom);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
