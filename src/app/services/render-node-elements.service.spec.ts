import { TestBed } from '@angular/core/testing';

import { RenderNodeElementsService } from './render-node-elements.service';

describe('RenderNodeElementsService', () => {
  let service: RenderNodeElementsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RenderNodeElementsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
