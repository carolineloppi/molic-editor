import { TestBed } from '@angular/core/testing';

import { ConnectElementsService } from './connect-elements.service';

describe('ConnectElementsService', () => {
  let service: ConnectElementsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConnectElementsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
