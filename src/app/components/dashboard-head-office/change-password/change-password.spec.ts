import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangePasswordHeadOfficeComponent } from './change-password';

describe('ChangePassword', () => {
  let component: ChangePasswordHeadOfficeComponent;
  let fixture: ComponentFixture<ChangePasswordHeadOfficeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangePasswordHeadOfficeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangePasswordHeadOfficeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
