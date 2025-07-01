import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultCommonStock } from './result-common-stock';

describe('ResultCommonStock', () => {
  let component: ResultCommonStock;
  let fixture: ComponentFixture<ResultCommonStock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultCommonStock]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResultCommonStock);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
