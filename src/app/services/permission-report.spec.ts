import { TestBed } from '@angular/core/testing';

import { PermissionReport } from './permission-report';

describe('Signature', () => {
  let service: PermissionReport;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PermissionReport);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
