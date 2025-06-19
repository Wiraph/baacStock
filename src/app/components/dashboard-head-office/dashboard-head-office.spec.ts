import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardHeadOfficeComponent } from './dashboard-head-office';

describe('DashboardHeadOffice', () => {
  let component: DashboardHeadOfficeComponent;
  let fixture: ComponentFixture<DashboardHeadOfficeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardHeadOfficeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardHeadOfficeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
