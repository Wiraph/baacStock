import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashbordSystem } from './dashbord-system';

describe('DashbordSystem', () => {
  let component: DashbordSystem;
  let fixture: ComponentFixture<DashbordSystem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashbordSystem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashbordSystem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
