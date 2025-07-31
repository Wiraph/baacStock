import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpinFilesComponent } from './spin-files';

describe('SpinFiles', () => {
  let component: SpinFilesComponent;
  let fixture: ComponentFixture<SpinFilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpinFilesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpinFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
