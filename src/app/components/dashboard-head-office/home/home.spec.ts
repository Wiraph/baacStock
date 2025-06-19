import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeHeadOfficeComponent } from './home';

describe('Home', () => {
  let component: HomeHeadOfficeComponent;
  let fixture: ComponentFixture<HomeHeadOfficeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeHeadOfficeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeHeadOfficeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
