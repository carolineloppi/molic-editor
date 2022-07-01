import { SimpleNodeTypeEnum } from './../model/enums/simple-node-type';
import { TestBed } from '@angular/core/testing';
import { MockService } from 'ng-mocks';
import { GenericCanvasService } from './generic-canvas.service';

import { RenderNodeElementsService } from './render-node-elements.service';

describe('RenderNodeElementsService', () => {
  let service: RenderNodeElementsService;

  const mockCanvasService = MockService(GenericCanvasService);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [],
      providers: [
        { provide: GenericCanvasService, useValue: mockCanvasService },
      ],
    }).compileComponents();

    service = TestBed.inject(RenderNodeElementsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('on create scene with additional properties', () => {
    beforeEach(() => {
      spyOn(mockCanvasService, 'addElementToCanvas').and.callFake(() => {});
      spyOn(service, 'renderElement').and.callFake(() => {});

      service.createSceneWithAdditionalProperties(
        {},
        {},
        '1',
        SimpleNodeTypeEnum.scene,
        {}
      );
    });
    it('should call addElementToCanvas', () => {
      expect(mockCanvasService.addElementToCanvas).toHaveBeenCalled();
    });

    it('should call renderElement', () => {
      expect(service.renderElement).toHaveBeenCalled();
    });
  });

  describe('on create simple element', () => {
    beforeEach(() => {
      spyOn(mockCanvasService, 'addElementToCanvas').and.callFake(() => {});
      spyOn(service, 'renderElement').and.callFake(() => {});

      service.createSimpleElement({}, '1', SimpleNodeTypeEnum.scene, {});
    });
    it('should call addElementToCanvas', () => {
      expect(mockCanvasService.addElementToCanvas).toHaveBeenCalled();
    });

    it('should call renderElement', () => {
      expect(service.renderElement).toHaveBeenCalled();
    });
  });
});
