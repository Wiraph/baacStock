import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Report16ShareholderSticker } from './report-16-shareholder-sticker';

describe('Report16ShareholderSticker', () => {
  let component: Report16ShareholderSticker;
  let fixture: ComponentFixture<Report16ShareholderSticker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Report16ShareholderSticker]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Report16ShareholderSticker);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
