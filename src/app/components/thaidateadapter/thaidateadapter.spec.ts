import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Thaidateadapter } from './thaidateadapter';

describe('Thaidateadapter', () => {
  let component: Thaidateadapter;
  let fixture: ComponentFixture<Thaidateadapter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Thaidateadapter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Thaidateadapter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
