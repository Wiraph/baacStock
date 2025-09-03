import { TestBed } from '@angular/core/testing';

import { StockMetadata } from './stock-metadata';

describe('StockMetadata', () => {
  let service: StockMetadata;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StockMetadata);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
