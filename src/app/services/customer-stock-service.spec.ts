import { TestBed } from '@angular/core/testing';

import { CustomerStockService } from './customer-stock-service';

describe('CustomerStockService', () => {
  let service: CustomerStockService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomerStockService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
