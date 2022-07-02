import { EdgeTypeEnum } from './../model/enums/edge-type';
import { TestBed } from '@angular/core/testing';
import { MockService } from 'ng-mocks';

import { ConnectElementsService } from './connect-elements.service';
import { GenericCanvasService } from './generic-canvas.service';

describe('ConnectElementsService', () => {
  let service: ConnectElementsService;

  const mockCanvasService = MockService(GenericCanvasService);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [],
      providers: [
        { provide: GenericCanvasService, useValue: mockCanvasService },
      ],
    }).compileComponents();

    service = TestBed.inject(ConnectElementsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('on create transitional element', () => {
    beforeEach(() => {
      spyOn(service, 'showErrorMessage');
      spyOn(mockCanvasService, 'addElementToCanvas').and.callFake(() => {});
      spyOn(service, 'connectTwoElements').and.returnValue(['mock_connection']);
    });

    it('should show error message if source or target are not selected', () => {
      spyOn(service, 'getSource').and.returnValue('Scene_1');
      spyOn(service, 'getTarget').and.returnValue(undefined);
      spyOn(service, 'getUtterance').and.returnValue('u: error text');

      service.createTransitionalElement({}, {}, '1', EdgeTypeEnum.turn_giving);
      expect(service.showErrorMessage).toHaveBeenCalledWith(
        'Select both source and target nodes'
      );
    });
    it('should show error message if source and target are equal', () => {
      spyOn(service, 'getSource').and.returnValue('Scene_1');
      spyOn(service, 'getTarget').and.returnValue('Scene_1');
      spyOn(service, 'getUtterance').and.returnValue('u: error text');

      service.createTransitionalElement({}, {}, '1', EdgeTypeEnum.turn_giving);
      expect(service.showErrorMessage).toHaveBeenCalledWith(
        'Source and target nodes should be different'
      );
    });

    it('should call connect create connection', () => {
      spyOn(service, 'getSource').and.returnValue('Scene_1');
      spyOn(service, 'getTarget').and.returnValue('Scene_2');
      spyOn(service, 'getUtterance').and.returnValue('u: ok text');
      service.createTransitionalElement({}, {}, '1', EdgeTypeEnum.turn_giving);

      expect(service.connectTwoElements).toHaveBeenCalled();
    });
  });

  describe('on connect two elements', () => {
    beforeEach(() => {
      spyOn(mockCanvasService, 'getCanvasElementById');
      spyOn(service, 'showErrorMessage');
    });

    it('should validate canvas content', () => {
      spyOn(service, 'validateCanvasContent').and.returnValue(false);

      service.connectTwoElements(
        {},
        '1',
        EdgeTypeEnum.turn_giving,
        'Ubiquitous Acess_3',
        'System Process_2',
        'd: system error'
      );
      expect(service.validateCanvasContent).toHaveBeenCalled();
    });
  });

  it('should validate origin content', () => {
    spyOn(service, 'showErrorMessage');
    spyOn(service, 'validateCanvasContent').and.returnValue(true);
    spyOn(mockCanvasService, 'getCanvasElementById').and.returnValue(undefined);

    service.connectTwoElements(
      {},
      '1',
      EdgeTypeEnum.turn_giving,
      'Ubiquitous Acess_3',
      'System Process_2',
      'd: system error'
    );
    expect(service.showErrorMessage).toHaveBeenCalledWith(
      'Origin element is not available to connect with'
    );
  });

  it('should validate target content', () => {
    spyOn(service, 'showErrorMessage');
    spyOn(service, 'validateCanvasContent').and.returnValue(true);
    spyOn(service, 'validateOriginElement').and.returnValue(true);
    spyOn(mockCanvasService, 'getCanvasElementById').and.returnValue(undefined);

    service.connectTwoElements(
      {},
      '1',
      EdgeTypeEnum.turn_giving,
      'Ubiquitous Acess_3',
      'System Process_2',
      'd: system error'
    );
    expect(service.showErrorMessage).toHaveBeenCalledWith(
      'Target element is not available to connect with'
    );
  });
});
