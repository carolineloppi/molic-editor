import { EdgeTypeEnum } from './../model/edge-type';
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { SimpleNodeTypeEnum } from './../model/simple-node-type';

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

  constructor(private formBuilder: FormBuilder) {
    this.additionalPropertiesFormGroup = this.formBuilder.group({
      topic: '',
      dialogs: '',
    });

    this.transitionalPropertiesFormGroup = this.formBuilder.group({
      source: '',
      target: '',
      utterance: '',
    });

    // TODO VERSION2: update inicial Ids when loading XML project file.
    this.elementsIdMap.set(SimpleNodeTypeEnum.ubiquitous_acess, 0);
    this.elementsIdMap.set(SimpleNodeTypeEnum.system_process, 0);
    this.elementsIdMap.set(SimpleNodeTypeEnum.start_node, 0);
    this.elementsIdMap.set(SimpleNodeTypeEnum.end_node, 0);
    this.elementsIdMap.set(EdgeTypeEnum.edge, 0);
    this.elementsIdMap.set(EdgeTypeEnum.dashed_edge, 0);
    this.elementsIdMap.set(SimpleNodeTypeEnum.scene, 0);
    this.elementsIdMap.set(SimpleNodeTypeEnum.dashed_scene, 0);
  }

  ngOnInit(): void {
    this.canvas = new fabric.Canvas('canvas', {
      hoverCursor: 'pointer',
      selection: true,
      selectionBorderColor: 'blue',
    });
    this.canvas.setWidth(this.size.width);
    this.canvas.setHeight(this.size.height);
    this.viewScreen = 'elementsPanel';
    fabric.Object.prototype.originX = fabric.Object.prototype.originY =
      'center';

    // DEV_NOTE: test with mouse: up and run with mouse:move
    this.canvas.on('mouse:move', (e) => {
      if (!this.canvas.getActiveObject() || e.target == null) {
        return;
      }

      if (e.target !== this.canvas.getActiveObject()) {
        return;
      }
      const p = e.target;
      if (!p.lines || p.lines.length === 0) {
        return;
      }

      p.lines.forEach((line) => {
        if (!line) {
          return;
        }

        const originXPosition = line.originElement.oCoords.ml.x;
        const targetXPosition = line.targetElement.oCoords.ml.x;

        if (line) {
          let movingElement;
          let anchoredElement;

          if (e.target === line.originElement) {
            movingElement = line.originElement;
            anchoredElement = line.targetElement;
          } else {
            movingElement = line.targetElement;
            anchoredElement = line.originElement;
          }

          if (movingElement.oCoords.ml.x < anchoredElement.oCoords.ml.x) {
            line.set({
              x1: movingElement.left,
              y1: movingElement.top,
            });
            line.set({
              x2: anchoredElement.left,
              y2: anchoredElement.top,
            });
          } else {
            line.set({
              x2: movingElement.left,
              y2: movingElement.top,
            });
            line.set({
              x1: anchoredElement.left,
              y1: anchoredElement.top,
            });
          }

          // Update triangle and utterance position relative to the connection line.
          line.triangle.set({
            left: line.getCenterPoint().x,
            top: line.getCenterPoint().y,
            angle: this.calcArrowAngle(
              line.originElement.oCoords.ml.x,
              line.originElement.oCoords.ml.y,
              line.targetElement.oCoords.ml.x,
              line.targetElement.oCoords.ml.y
            ),
          });

          line.utteranceText.set({
            left: line.getCenterPoint().x,
            top: line.getCenterPoint().y - 20,
          });

          this.canvas.sendToBack(line.line);

          this.canvas.requestRenderAll();
        }
      });

      this.canvas.renderAll();
    });
  }

  /*
  This calcArrowAngle function below (with a few adjusts) was provided in a StackOverflow answer and used here.
  It servers the purpose of calculating the rotation of the connection's arrow when moving an element in the Canvas.
  Full answer can be found here: https://stackoverflow.com/questions/42800110/fabric-js-arrows-and-arrow-head-rotating  */
  calcArrowAngle(
    originElementX: number,
    originElementY: number,
    targetElementX: number,
    targetElementY: number
  ): number {
    let angle = 0;
    const horizontalDiff = targetElementX - originElementX;
    const verticalDiff = targetElementY - originElementY;

    if (horizontalDiff === 0) {
      angle =
        verticalDiff === 0
          ? 0
          : verticalDiff > 0
          ? Math.PI / 2
          : (Math.PI * 3) / 2;
    } else if (verticalDiff === 0) {
      angle = horizontalDiff > 0 ? 0 : Math.PI;
    } else {
      angle =
        horizontalDiff < 0
          ? Math.atan(verticalDiff / horizontalDiff) + Math.PI
          : verticalDiff < 0
          ? Math.atan(verticalDiff / horizontalDiff) + 2 * Math.PI
          : Math.atan(verticalDiff / horizontalDiff);
    }

    return (angle * 180) / Math.PI + 90;
  }

  // Selects the object on Canvas.
  selectCanvasObject(obj): void {
    this.canvas.discardActiveObject().renderAll();
    this.canvas.setActiveObject(obj);
  }

  // Creates the selected element and adds it to Canvas.
  createElement(figure): void {
    this.currentRenderingFigure = figure;

    switch (figure) {
      case EdgeTypeEnum.edge:
        this.viewScreen = 'transitionPropertiesPanel';
        this.currentArrowType = EdgeTypeEnum.edge;
        break;
      case EdgeTypeEnum.dashed_edge:
        this.viewScreen = 'transitionPropertiesPanel';
        this.currentArrowType = EdgeTypeEnum.dashed_edge;

        break;

      case SimpleNodeTypeEnum.scene:
      case SimpleNodeTypeEnum.dashed_scene:
        this.viewScreen = 'additionalPropertiesPanel';
        break;

      default:
        this.createSimpleElement();
        return;
    }

    // TODO VERSION2: create nodes and edges and add to Diagram model class in order to generate the XML file
  }

  // Calls the canvas rendering functions for each non-edge element
  renderElement(elementId: string, topic?: string, description?: string): any {
    if (!elementId) {
      return;
    }

    switch (this.currentRenderingFigure) {
      case SimpleNodeTypeEnum.scene:
        return this.createSceneElement(
          elementId,
          topic ? topic : '',
          description ? description : ''
        );
      case SimpleNodeTypeEnum.dashed_scene:
        return this.createDashedSceneElement(
          elementId,
          topic ? topic : '',
          description ? description : ''
        );
      case SimpleNodeTypeEnum.ubiquitous_acess:
        return this.createUbiquitousElement(
          SimpleNodeTypeEnum.ubiquitous_acess +
            ' - ' +
            this.elementsIdMap.get(SimpleNodeTypeEnum.ubiquitous_acess)
        );
      case SimpleNodeTypeEnum.system_process:
        return this.createProcessingBoxElement(
          SimpleNodeTypeEnum.system_process +
            ' - ' +
            this.elementsIdMap.get(SimpleNodeTypeEnum.system_process)
        );
      case SimpleNodeTypeEnum.start_node:
        return this.createStartPointElement(
          SimpleNodeTypeEnum.start_node +
            ' - ' +
            this.elementsIdMap.get(SimpleNodeTypeEnum.start_node)
        );
      case SimpleNodeTypeEnum.end_node:
        return this.createEndPointElement(
          SimpleNodeTypeEnum.end_node +
            ' - ' +
            this.elementsIdMap.get(SimpleNodeTypeEnum.end_node)
        );
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
      SimpleNodeTypeEnum.dashed_scene,
      SimpleNodeTypeEnum.scene,
      SimpleNodeTypeEnum.start_node,
      SimpleNodeTypeEnum.end_node,
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

  // Connects two node elements.
  connectTwoElements(
    elementId: string,
    originElementId: string,
    targetElementId: string,
    utterance: string
  ): fabric.any[] {
    if (this.canvas.getObjects().length < 2) {
      console.log('There are not enough elements to create a connection');
      return;
    }

    const origin: fabric.Group = this.canvas
      .getObjects()
      .filter((el) => el.id === originElementId)[0];

    const target: fabric.Group = this.canvas
      .getObjects()
      .filter((el) => el.id === targetElementId)[0];

    if (!origin) {
      console.log('Origin element is not available to connect with');
      return;
    }

    if (!target) {
      console.log('Target element is not available to connect with');
      return;
    }

    switch (this.currentRenderingFigure) {
      case EdgeTypeEnum.dashed_edge:
        return this.createDashedArrowElement(
          elementId,
          origin,
          target,
          utterance ? utterance : ''
        );
      case EdgeTypeEnum.edge:
        return this.createArrowElement(elementId, origin, target, utterance);
    }
  }

  getArrowCoords(originElement, targetElement): number[] {
    // Find Arrow Start Point Coords
    const originTrY = originElement.aCoords.tr.y;
    const originBrY = originElement.aCoords.br.y;
    const originTrX = originElement.aCoords.tr.x;

    const arrowStartX = originTrX;
    const arrowStartY = originTrY + (originBrY - originTrY) / 2;

    // Find Arrow End Point Coords
    const targetTlY = targetElement.aCoords.tl.y;
    const targetBlY = targetElement.aCoords.bl.y;
    const targetTlX = targetElement.aCoords.tl.x;

    const arrowEndX = targetTlX;
    const arrowEndY = targetTlY + (targetBlY - targetTlY) / 2;

    return [arrowStartX, arrowStartY, arrowEndX, arrowEndY];
  }

  // Creates simple edge element.
  createArrowElement(
    identifier: string,
    originElement,
    targetElement,
    utterance: string
  ): fabric.any[] {
    const coords = this.getArrowCoords(originElement, targetElement);

    const line = new fabric.Line(coords, {
      stroke: '#bab8b8',
      strokeWidth: 1,
    });

    const triangle = new fabric.Triangle({
      width: 15,
      height: 20,
      fill: '#908C8C',
      left: line.getCenterPoint().x,
      top: line.getCenterPoint().y,
      angle: this.calcArrowAngle(coords[0], coords[1], coords[2], coords[3]),
    });

    const utteranceText = new fabric.IText(utterance, {
      left: line.getCenterPoint().x,
      top: line.getCenterPoint().y - 20,
      angle: 0,
      fontFamily: 'helvetica',
      fill: '#000000',
      scaleX: 0.5,
      scaleY: 0.5,
      fontSize: 30,
      hasRotatingPoint: true,
    });

    line.id = identifier;
    line.type = EdgeTypeEnum.edge;
    line.hasBorders = false;
    line.hasControls = false;
    line.originElement = originElement;
    line.targetElement = targetElement;
    line.selectable = false;
    line.evented = false;

    line.triangle = triangle;
    line.utteranceText = utteranceText;

    originElement.lines.push(line);
    targetElement.lines.push(line);

    return [line, triangle, utteranceText];
  }

  // Creates dashed edge element.
  createDashedArrowElement(
    identifier: string,
    originElement,
    targetElement,
    utterance: string
  ): fabric.any[] {
    const coords = this.getArrowCoords(originElement, targetElement);

    const dashedLine = new fabric.Line(coords, {
      stroke: '#bab8b8',
      strokeWidth: 1,
      strokeDashArray: [3, 3],
    });

    const triangle = new fabric.Triangle({
      width: 15,
      height: 20,
      fill: '#908C8C',
      left: dashedLine.getCenterPoint().x,
      top: dashedLine.getCenterPoint().y,
      angle: this.calcArrowAngle(coords[0], coords[1], coords[2], coords[3]),
      selectable: false,
    });

    const utteranceText = new fabric.IText(utterance, {
      left: dashedLine.getCenterPoint().x,
      top: dashedLine.getCenterPoint().y - 20,
      angle: 0,
      fontFamily: 'helvetica',
      fill: '#000000',
      scaleX: 0.5,
      scaleY: 0.5,
      fontSize: 30,
      hasRotatingPoint: true,
    });

    dashedLine.id = identifier;
    dashedLine.type = EdgeTypeEnum.dashed_edge;
    dashedLine.hasBorders = false;
    dashedLine.hasControls = false;
    dashedLine.originElement = originElement;
    dashedLine.targetElement = targetElement;
    dashedLine.selectable = false;
    dashedLine.evented = false;

    dashedLine.triangle = triangle;
    dashedLine.utteranceText = utteranceText;

    originElement.lines.push(dashedLine);
    targetElement.lines.push(dashedLine);

    return [dashedLine, triangle, utteranceText];
  }

  // Creates simple scene element.
  createSceneElement(
    identifier: string,
    sceneName: string,
    dialogs: string
  ): fabric.Group {
    return new fabric.Group(
      [
        new fabric.Rect({
          radius: 2,
          width: 200,
          height: 140,
          left: 400,
          top: 100,
          angle: 0,
          fill: '#fff',
          rx: 29,
          ry: 29,
          stroke: '#908C8C',
          strokeWidth: 1.5,
          hasControls: false,
          hasBorders: false,
        }),

        new fabric.Textbox(sceneName, {
          width: 150,
          height: 100,
          top: 50,
          left: 390,
          fontSize: 16,
          textAlign: 'center',
        }),

        new fabric.Line([0, 200, 200, 200], {
          left: 400,
          top: 70,
          stroke: '#908C8C',
        }),

        new fabric.Textbox(dialogs, {
          width: 200,
          height: 200,
          top: 110,
          left: 400,
          fontSize: 16,
          textAlign: 'center',
        }),
      ],
      {
        id: SimpleNodeTypeEnum.scene + ' - ' + identifier,
        type: SimpleNodeTypeEnum.scene,
        viewName: sceneName,
        hasBorders: false,
        hasControls: false,
        lines: [],
      }
    );
  }

  // Creates dashed scene element.
  createDashedSceneElement(
    identifier: string,
    sceneName: string,
    dialogs: string
  ): fabric.Group {
    return new fabric.Group(
      [
        new fabric.Rect({
          radius: 2,
          width: 200,
          height: 140,
          left: 700,
          top: 100,
          angle: 0,
          fill: '#fff',
          rx: 29,
          ry: 29,
          stroke: '#908C8C',
          strokeWidth: 1.5,
          strokeDashArray: [5, 5],
          hasControls: false,
          hasBorders: false,
        }),

        new fabric.Textbox(sceneName, {
          width: 150,
          height: 100,
          top: 50,
          left: 690,
          fontSize: 16,
          textAlign: 'center',
        }),

        new fabric.Line([0, 200, 200, 200], {
          left: 700,
          top: 70,
          stroke: '#908C8C',
          strokeDashArray: [5, 5],
        }),

        new fabric.Textbox(dialogs, {
          width: 200,
          height: 200,
          top: 110,
          left: 700,
          fontSize: 16,
          textAlign: 'center',
        }),
      ],
      {
        id: SimpleNodeTypeEnum.dashed_scene + ' - ' + identifier,
        type: SimpleNodeTypeEnum.dashed_scene,
        viewName: sceneName,
        hasBorders: false,
        hasControls: false,
        lines: [],
      }
    );
  }

  // Creates end point element.
  createEndPointElement(identifier: string): fabric.Group {
    return new fabric.Group(
      [
        new fabric.Circle({
          radius: 15,
          left: 200,
          stroke: 'black',
          strokeWidth: 2,
          top: 60,
          fill: '#fff',
        }),
        new fabric.Circle({
          radius: 10,
          left: 200,
          top: 60,
          fill: '#000',
        }),
      ],
      {
        id: identifier,
        type: SimpleNodeTypeEnum.end_node,
        hasBorders: false,
        hasControls: false,
        lines: [],
      }
    );
  }

  // Creates start point element.
  createStartPointElement(identifier: string): fabric.Circle {
    return new fabric.Circle({
      id: identifier,
      type: SimpleNodeTypeEnum.start_node,
      radius: 15,
      left: 120,
      top: 60,
      fill: '#000',
      hasControls: false,
      hasBorders: false,
      lines: [],
    });
  }

  // Creates system process element.
  createProcessingBoxElement(identifier: string): fabric.Rect {
    const systemProcess = new fabric.Rect({
      id: identifier,
      type: SimpleNodeTypeEnum.system_process,
      width: 30,
      height: 30,
      left: 1000,
      top: 70,
      angle: 0,
      fill: '#000',
      hasControls: false,
      hasBorders: false,
      lines: [],
    });

    this.canvas.bringToFront(systemProcess);
    return systemProcess;
  }

  // Creates ubiquitous element.
  createUbiquitousElement(identifier: string): fabric.Rect {
    const ubiquitous = new fabric.Rect({
      id: identifier,
      type: SimpleNodeTypeEnum.ubiquitous_acess,
      radius: 2,
      width: 100,
      height: 35,
      left: 900,
      top: 70,
      angle: 0,
      fill: '#DCD8D8',
      rx: 5,
      ry: 5,
      stroke: '#908C8C',
      strokeWidth: 1.5,
      hasControls: false,
      hasBorders: false,
      lines: [],
    });

    this.canvas.bringToFront(ubiquitous);
    return ubiquitous;
  }

  // Remove all elements from Canvas.
  public clearCanvas(): void {
    if (this.canvas) {
      this.canvas.clear();
    }
  }

  // Renders scene type elements and adds it to canvas.
  createSceneWithAdditionalProperties(formData): void {
    const topicKey = 'topic';
    const dialogsKey = 'dialogs';

    const topic = formData[topicKey];
    const dialogs = formData[dialogsKey];

    // create element
    this.viewScreen = 'elementsPanel';
    this.additionalPropertiesFormGroup.reset();

    this.addElementToCanvas(
      this.renderElement(this.getCurrentRenderingFigureId(), topic, dialogs)
    );
  }

  // Renders edge type elements and adds it to canvas.
  createTransitionalElement(formData): void {
    const sourceKey = 'source';
    const targetKey = 'target';
    const utteranceKey = 'utterance';

    const source = formData[sourceKey];
    const target = formData[targetKey];
    const utterance = formData[utteranceKey];

    if (!source || !target) {
      alert('Select both source and target nodes');
      return;
    }

    if (source == target) {
      alert('Source and target nodes should be different');
      return;
    }
    this.viewScreen = 'elementsPanel';
    this.transitionalPropertiesFormGroup.reset();

    const arrowContent: fabric.any[] = this.connectTwoElements(
      this.getCurrentRenderingFigureId(),
      source,
      target,
      utterance
    );

    if (!arrowContent) {
      return;
    }

    arrowContent.forEach((element) => {
      this.addElementToCanvas(element);
    });
  }

  // Renders non-edge and non-scene element and adds it to canvas.
  createSimpleElement(): void {
    this.addElementToCanvas(
      this.renderElement(this.getCurrentRenderingFigureId())
    );
  }

  // Returns current id for the current rendering figure type.
  getCurrentRenderingFigureId(): string {
    const elementId = this.elementsIdMap.get(this.currentRenderingFigure);
    this.updateIdMapCount(this.currentRenderingFigure);
    return elementId.toString();
  }

  // Adds an element to canvas and select it.
  addElementToCanvas(newElement: any): void {
    if (newElement) {
      this.canvas.add(newElement);
      this.selectCanvasObject(newElement);
    }
  }

  // Cancel the elements creation and removes it from Canvas.
  cancelElementCreation(elementType: string): void {
    switch (elementType) {
      case 'additionalProperties':
        this.additionalPropertiesFormGroup.reset();
        this.canvas.remove(this.canvas.getActiveObject());
        break;

      case 'transitionalProperties':
        this.transitionalPropertiesFormGroup.reset();
        const arrowUnderConstruction = this.canvas
          .getObjects()
          .filter(
            (el) => el.id === this.elementsIdMap.get(this.currentArrowType)
          )[0];

        this.canvas.remove(arrowUnderConstruction);
        break;
    }

    this.viewScreen = 'elementsPanel';
  }
}
