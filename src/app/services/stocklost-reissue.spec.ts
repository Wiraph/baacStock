import { TestBed } from '@angular/core/testing';
import { StockLostReissueService } from './stocklost-reissue';

describe('StockLostReissueService', () => {
  let service: StockLostReissueService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StockLostReissueService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
