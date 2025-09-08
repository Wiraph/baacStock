import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharelderType } from './sharelder-type';

describe('SharelderType', () => {
  let component: SharelderType;
  let fixture: ComponentFixture<SharelderType>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharelderType]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SharelderType);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
