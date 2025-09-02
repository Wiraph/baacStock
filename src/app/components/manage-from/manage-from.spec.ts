import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageFormComponent } from './manage-from';

describe('ManageFrom', () => {
  let component: ManageFormComponent;
  let fixture: ComponentFixture<ManageFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
