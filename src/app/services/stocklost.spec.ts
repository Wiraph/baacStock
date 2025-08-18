import { TestBed } from '@angular/core/testing';

import { Stocklost } from './stocklost';

describe('Stocklost', () => {
  let service: Stocklost;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Stocklost);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
