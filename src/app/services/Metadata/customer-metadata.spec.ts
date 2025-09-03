import { TestBed } from '@angular/core/testing';

import { CustomerMetadata } from './customer-metadata';

describe('CustomerMetadata', () => {
  let service: CustomerMetadata;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomerMetadata);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
