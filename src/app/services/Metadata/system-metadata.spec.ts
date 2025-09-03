import { TestBed } from '@angular/core/testing';

import { SystemMetadata } from './system-metadata';

describe('SystemMetadata', () => {
  let service: SystemMetadata;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SystemMetadata);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
