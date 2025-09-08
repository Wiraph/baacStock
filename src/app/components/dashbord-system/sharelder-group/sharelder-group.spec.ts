import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharelderGroup } from './sharelder-group';

describe('SharelderGroup', () => {
  let component: SharelderGroup;
  let fixture: ComponentFixture<SharelderGroup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharelderGroup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SharelderGroup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
