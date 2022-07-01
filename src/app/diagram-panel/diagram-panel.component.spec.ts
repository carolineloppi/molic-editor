import { ConnectElementsService } from './../services/connect-elements.service';
import { RenderNodeElementsService } from './../services/render-node-elements.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GenericCanvasService } from './../services/generic-canvas.service';
import { DiagramPanelComponent } from './diagram-panel.component';
import { MockService } from 'ng-mocks';
import { SimpleNodeTypeEnum } from '../model/enums/simple-node-type';
import { EdgeTypeEnum } from '../model/enums/edge-type';

import { fabric } from 'fabric';

describe('DiagramPanelComponent', () => {
  let component: DiagramPanelComponent;
  let fixture: ComponentFixture<DiagramPanelComponent>;

  const formBuilder = MockService(FormBuilder);
  const mockCanvasService = MockService(GenericCanvasService);
  const mockRenderNodeElemsService = MockService(RenderNodeElementsService);
  const mockConnectElementsService = MockService(ConnectElementsService);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [DiagramPanelComponent],
      providers: [
        { provide: FormBuilder, useValue: formBuilder },
        { provide: GenericCanvasService, useValue: mockCanvasService },
        {
          provide: RenderNodeElementsService,
          useValue: mockRenderNodeElemsService,
        },
        {
          provide: ConnectElementsService,
          useValue: mockConnectElementsService,
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    spyOn(mockCanvasService, 'setDefaultMouseMoveBehaviour').and.callFake(
      () => {}
    );

    fixture = TestBed.createComponent(DiagramPanelComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  describe('on create diagram-panel-component', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should set elements initial id', () => {
      const mockIdsMap: Map<string, number> = new Map([
        [SimpleNodeTypeEnum.ubiquitous_acess.toString(), 0],
        [SimpleNodeTypeEnum.system_process, 0],
        [SimpleNodeTypeEnum.conversation_opening, 0],
        [SimpleNodeTypeEnum.conversation_closing, 0],
        [EdgeTypeEnum.turn_giving, 0],
        [EdgeTypeEnum.breakdown_recovery_turn_giving, 0],
        [SimpleNodeTypeEnum.scene, 0],
        [SimpleNodeTypeEnum.alert_scene, 0],
      ]);
      expect(component.elementsIdMap).toEqual(mockIdsMap);
    });

    it('should set viewScreen', () => {
      expect(component.viewScreen).toBe('elementsPanel');
    });

    it('should set mouse watchers', () => {
      expect(mockCanvasService.setDefaultMouseMoveBehaviour).toHaveBeenCalled();
    });
  });

  describe('on create element', () => {
    it('should update to turnGiving mode', () => {
      component.createElement(EdgeTypeEnum.turn_giving);

      expect(component.viewScreen).toBe('transitionPropertiesPanel');
      expect(component.currentArrowType).toBe(EdgeTypeEnum.turn_giving);
    });

    it('should update to breakdown recovery turnGiving mode', () => {
      component.createElement(EdgeTypeEnum.breakdown_recovery_turn_giving);

      expect(component.viewScreen).toBe('transitionPropertiesPanel');
      expect(component.currentArrowType).toBe(
        EdgeTypeEnum.breakdown_recovery_turn_giving
      );
    });

    it('should update to scene creation mode', () => {
      component.createElement(SimpleNodeTypeEnum.scene);

      expect(component.viewScreen).toBe('additionalPropertiesPanel');
    });

    it('should update to alert scene creation mode', () => {
      component.createElement(SimpleNodeTypeEnum.alert_scene);

      expect(component.viewScreen).toBe('additionalPropertiesPanel');
    });

    it('should create simple element', () => {
      spyOn(mockRenderNodeElemsService, 'createSimpleElement');
      component.createElement(SimpleNodeTypeEnum.ubiquitous_acess);

      expect(
        mockRenderNodeElemsService.createSimpleElement
      ).toHaveBeenCalledWith(
        component.canvas,
        '0',
        SimpleNodeTypeEnum.ubiquitous_acess,
        component.elementsIdMap
      );
    });
  });

  it('on update id map count', () => {
    const currentElementId = component.elementsIdMap.get(
      SimpleNodeTypeEnum.ubiquitous_acess
    );
    component.updateIdMapCount(SimpleNodeTypeEnum.ubiquitous_acess);
    expect(
      component.elementsIdMap.get(SimpleNodeTypeEnum.ubiquitous_acess)
    ).toBe(currentElementId + 1);
  });

  it('on get connectable elements', () => {
    spyOn(mockCanvasService, 'getConnectableElementsOnly');
    component.getConnectableElements();
    expect(mockCanvasService.getConnectableElementsOnly).toHaveBeenCalled();
  });

  describe('on cancel element creation', () => {
    it('should remove element from canvas', () => {
      spyOn(component, 'clearForm').and.callFake(() => {});
      spyOn(mockCanvasService, 'removeActiveElementFromCanvas');
      component.cancelElementCreation('additionalProperties');
      expect(
        mockCanvasService.removeActiveElementFromCanvas
      ).toHaveBeenCalled();
    });

    it('should set view screen to elements panel', () => {
      spyOn(component, 'clearForm').and.callFake(() => {});
      component.cancelElementCreation('additionalProperties');
      expect(component.viewScreen).toBe('elementsPanel');
    });
  });

  it('on clear canvas', () => {
    spyOn(mockCanvasService, 'clearCanvas');
    component.clearCanvas();
    expect(mockCanvasService.clearCanvas).toHaveBeenCalled();
  });

  describe('on ask for transitional properties', () => {
    beforeEach(() => {
      spyOn(component, 'clearForm').and.callFake(() => {});
      spyOn(
        mockConnectElementsService,
        'createTransitionalElement'
      ).and.callFake(() => {});
      spyOn(component, 'getCurrentRenderingFigureId').and.returnValue('1');

      component.askForTransitionalProperties({});
    });
    it('should call createTransitionalElement', () => {
      expect(
        mockConnectElementsService.createTransitionalElement
      ).toHaveBeenCalled();
    });
    it('should update viewScreen', () => {
      expect(component.viewScreen).toBe('elementsPanel');
    });
    it('should clear form', () => {
      expect(component.clearForm).toHaveBeenCalled();
    });
  });

  describe('on ask for scene additional properties', () => {
    beforeEach(() => {
      spyOn(component, 'clearForm').and.callFake(() => {});
      spyOn(
        mockRenderNodeElemsService,
        'createSceneWithAdditionalProperties'
      ).and.callFake(() => {});
      spyOn(component, 'getCurrentRenderingFigureId').and.returnValue('1');

      component.askForScenesAdditionalProperties({});
    });
    it('should call createTransitionalElement', () => {
      expect(
        mockRenderNodeElemsService.createSceneWithAdditionalProperties
      ).toHaveBeenCalled();
    });
    it('should update viewScreen', () => {
      expect(component.viewScreen).toBe('elementsPanel');
    });
    it('should clear form', () => {
      expect(component.clearForm).toHaveBeenCalled();
    });
  });
});
