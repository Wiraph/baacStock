import { TestBed } from '@angular/core/testing';

import { AddressMetadata } from './address-metadata';

describe('AddressMetadata', () => {
  let service: AddressMetadata;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AddressMetadata);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
