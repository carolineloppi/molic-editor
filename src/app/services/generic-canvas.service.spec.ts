import { TestBed } from '@angular/core/testing';

import { GenericCanvasService } from './generic-canvas.service';

describe('GenericCanvasService', () => {
  let service: GenericCanvasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GenericCanvasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
