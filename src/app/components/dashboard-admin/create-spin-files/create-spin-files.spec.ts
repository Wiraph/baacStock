import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSpinFilesComponent } from './create-spin-files';

describe('CreateSpinFiles', () => {
  let component: CreateSpinFilesComponent;
  let fixture: ComponentFixture<CreateSpinFilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateSpinFilesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateSpinFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
