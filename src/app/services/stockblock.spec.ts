import { TestBed } from '@angular/core/testing';
import { StockBlockService } from './stockblock';

describe('StockBlockService', () => {
  let service: StockBlockService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StockBlockService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
