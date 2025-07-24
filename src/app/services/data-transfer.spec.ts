import { TestBed } from '@angular/core/testing';

import { DataTransfer } from './data-transfer';

describe('DataTransfer', () => {
  let service: DataTransfer;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataTransfer);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
