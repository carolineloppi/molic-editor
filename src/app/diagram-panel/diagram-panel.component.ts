import { ConnectElementsService } from './../services/connect-elements.service';
import { RenderNodeElementsService } from './../services/render-node-elements.service';
import { GenericCanvasService } from './../services/generic-canvas.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { EdgeTypeEnum } from '../model/enums/edge-type';
import { SimpleNodeTypeEnum } from '../model/enums/simple-node-type';

import { fabric } from 'fabric';

@Component({
  selector: 'app-diagram-panel',
  templateUrl: './diagram-panel.component.html',
  styleUrls: ['./diagram-panel.component.css'],
})

// TODO: permitir deleção de item
export class DiagramPanelComponent implements OnInit {
  private canvas: any;

  // Panel currently visible.
  // Values are: elementsPanel, transitionPropertiesPanel and additionalPropertiesPanel
  viewScreen: string;

  // Form group of scene properties.
  additionalPropertiesFormGroup;

  // Form group of edge property.
  transitionalPropertiesFormGroup;

  // Active figure under construction.
  currentRenderingFigure: any;

  currentArrowType: any;

  // Canvas default size.
  private size: any = {
    width: window.innerWidth,
    height: 1000,
  };

  // Enables enum acess to HTMl.
  SimpleNodeType = SimpleNodeTypeEnum;
  EdgeType = EdgeTypeEnum;

  // Map to keep track of elements id.
  elementsIdMap = new Map<string, number>();

  constructor(
    private formBuilder: FormBuilder,
    private canvasService: GenericCanvasService,
    private renderNodeElemsService: RenderNodeElementsService,
    private connectElementsService: ConnectElementsService
  ) {
    this.additionalPropertiesFormGroup = this.formBuilder.group({
      topic: '',
      dialogs: '',
    });

    this.transitionalPropertiesFormGroup = this.formBuilder.group({
      source: '',
      target: '',
      utterance: '',
    });

    this.setElementsInitialId();
  }

  ngOnInit(): void {
    // Canvas setup
    this.canvas = new fabric.Canvas('canvas', {
      hoverCursor: 'pointer',
      selection: true,
      selectionBorderColor: 'blue',
    });
    this.canvas.setWidth(this.size.width);
    this.canvas.setHeight(this.size.height);

    // Default view screen to panel with elements
    this.viewScreen = 'elementsPanel';

    // Sets element origin position to center
    fabric.Object.prototype.originX = fabric.Object.prototype.originY =
      'center';

    // Reposition element and connection when moving
    this.canvas.on('mouse:move', (e) => {
      this.canvasService.updateConnectionPosition(this.canvas, e);
      this.canvas.renderAll();
    });
  }

  // Sets initial id for each element type.
  // TODO VERSION2: update inicial Ids when loading XML project file.
  setElementsInitialId(): void {
    this.elementsIdMap.set(SimpleNodeTypeEnum.ubiquitous_acess, 0);
    this.elementsIdMap.set(SimpleNodeTypeEnum.system_process, 0);
    this.elementsIdMap.set(SimpleNodeTypeEnum.conversation_opening, 0);
    this.elementsIdMap.set(SimpleNodeTypeEnum.conversation_closing, 0);
    this.elementsIdMap.set(EdgeTypeEnum.turn_giving, 0);
    this.elementsIdMap.set(EdgeTypeEnum.breakdown_recovery_turn_giving, 0);
    this.elementsIdMap.set(SimpleNodeTypeEnum.scene, 0);
    this.elementsIdMap.set(SimpleNodeTypeEnum.alert_scene, 0);
  }

  // Creates the selected element and adds it to Canvas.
  // TODO VERSION2: create nodes and edges and add to Diagram model class in order to generate the XML file
  createElement(figure): void {
    this.currentRenderingFigure = figure;

    switch (figure) {
      case EdgeTypeEnum.turn_giving:
        this.viewScreen = 'transitionPropertiesPanel';
        this.currentArrowType = EdgeTypeEnum.turn_giving;
        break;
      case EdgeTypeEnum.breakdown_recovery_turn_giving:
        this.viewScreen = 'transitionPropertiesPanel';
        this.currentArrowType = EdgeTypeEnum.breakdown_recovery_turn_giving;
        break;

      case SimpleNodeTypeEnum.scene:
      case SimpleNodeTypeEnum.alert_scene:
        this.viewScreen = 'additionalPropertiesPanel';
        break;

      default:
        this.renderNodeElemsService.createSimpleElement(
          this.canvas,
          this.getCurrentRenderingFigureId(),
          this.currentRenderingFigure,
          this.elementsIdMap
        );
        return;
    }
  }

  // Updates elementType id.
  updateIdMapCount(elementType: string): void {
    const currentValue: number = this.elementsIdMap.get(elementType);
    this.elementsIdMap.set(elementType, currentValue + 1);
  }

  // Return elements that can be connected by edges.
  getConnectableElements(): any {
    const connectableTypes = [
      SimpleNodeTypeEnum.alert_scene,
      SimpleNodeTypeEnum.scene,
      SimpleNodeTypeEnum.conversation_opening,
      SimpleNodeTypeEnum.conversation_closing,
      SimpleNodeTypeEnum.system_process,
      SimpleNodeTypeEnum.ubiquitous_acess,
    ];
    const elementsArray = this.canvas
      .getObjects()
      .filter((el) => connectableTypes.includes(el.type));

    // TODO VERSION2: Since this array is currently with duplicates, it's being filtered for unique id values.
    const filteredElementsArray = [...new Set(elementsArray)];

    return filteredElementsArray;
  }

  // Returns current id for the current rendering figure type.
  getCurrentRenderingFigureId(): string {
    const elementId = this.elementsIdMap.get(this.currentRenderingFigure);
    this.updateIdMapCount(this.currentRenderingFigure);
    return elementId.toString();
  }

  // Cancel the elements creation and removes it from Canvas.
  cancelElementCreation(elementType: string): void {
    switch (elementType) {
      case 'additionalProperties':
        this.additionalPropertiesFormGroup.reset();
        this.canvasService.removeElementFromCanvas(
          this.canvas,
          this.canvas.getActiveObject()
        );
        break;

      case 'transitionalProperties':
        this.transitionalPropertiesFormGroup.reset();
        const arrowUnderConstruction = this.canvas
          .getObjects()
          .filter(
            (el) => el.id === this.elementsIdMap.get(this.currentArrowType)
          )[0];

        this.canvasService.removeElementFromCanvas(
          this.canvas,
          arrowUnderConstruction
        );
        break;
    }

    this.viewScreen = 'elementsPanel';
  }

  // Remove all elements from Canvas.
  clearCanvas(): void {
    this.canvasService.clearCanvas(this.canvas);
  }

  // Creates Transitional Element with form data.
  askForTransitionalProperties(formData): void {
    this.connectElementsService.createTransitionalElement(
      this.canvas,
      formData,
      this.getCurrentRenderingFigureId(),
      this.currentRenderingFigure
    );
    this.viewScreen = 'elementsPanel';
    this.transitionalPropertiesFormGroup.reset();
  }

  // Creates Scene Element with form data.
  askForScenesAdditionalProperties(formData): void {
    this.renderNodeElemsService.createSceneWithAdditionalProperties(
      this.canvas,
      formData,
      this.getCurrentRenderingFigureId(),
      this.currentRenderingFigure,
      this.elementsIdMap
    );
    this.viewScreen = 'elementsPanel';
    this.additionalPropertiesFormGroup.reset();
  }
}
