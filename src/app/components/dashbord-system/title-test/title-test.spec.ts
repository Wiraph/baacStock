import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TitleTest } from './title-test';

describe('TitleTest', () => {
  let component: TitleTest;
  let fixture: ComponentFixture<TitleTest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TitleTest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TitleTest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
