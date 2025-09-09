import { TestBed } from '@angular/core/testing';

import { SyscfgService } from './syscfg';

describe('Syscfg', () => {
  let service: SyscfgService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SyscfgService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
