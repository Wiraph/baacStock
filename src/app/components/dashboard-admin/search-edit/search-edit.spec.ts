import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchEditComponent } from './search-edit';

describe('SearchEdit', () => {
  let component: SearchEditComponent;
  let fixture: ComponentFixture<SearchEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
