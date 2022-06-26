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

//TODO: Adicionar o objeto linha aos outros elementos. Transforar tudo para array de linhas.
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
    width: 1200,
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

    // TODO: atualizar ids iniciais ao carregar o XML.
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

    //test with up //run with move
    this.canvas.on('mouse:move', (e) => {
      if (!this.canvas.getActiveObject() || e.target == null) {
        return;
      }

      if (e.target != this.canvas.getActiveObject()) {
        return;
      }
      var p = e.target;
      if (!p.line1 || p.line1.length == 0) {
        return;
      }

      p.line1.forEach((line) => {
        if (!line) {
          return;
        }

        let originXPosition = line.originElement.oCoords.ml.x;
        let targetXPosition = line.targetElement.oCoords.ml.x;

        if (line) {
          let movingElement;
          let anchoredElement;

          if (e.target == line.originElement) {
            movingElement = line.originElement;
            anchoredElement = line.targetElement;
          } else {
            movingElement = line.targetElement;
            anchoredElement = line.originElement;
          }

          if (movingElement.oCoords.ml.x < anchoredElement.oCoords.ml.x) {
            line.set({ x1: movingElement.left, y1: movingElement.top });
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
          this.canvas.sendToBack(line);
        }
      });

      this.canvas.renderAll();
    });
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

    // TODO: criar node e edge e adicionar aos arrays do diagram.ts representando o modelo para gerar xml
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
    return this.canvas
      .getObjects()
      .filter(
        (el) =>
          el.type !== EdgeTypeEnum.dashed_edge && el.type !== EdgeTypeEnum.edge
      );
  }

  //TODO: filtrar a lista e descobrir motivo da duplicidade.
  // Connects two node elements.
  connectTwoElements(
    elementId: string,
    originElementId: string,
    targetElementId: string,
    utterance: string
  ): fabric.Group {
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
          utterance
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

    // console.log('Start Arrow X: ', arrowStartX);
    //console.log('Start Arrow Y: ', arrowStartY);

    //console.log('End Arrow X: ', arrowEndX);
    //console.log('End Arrow Y: ', arrowEndY);

    return [arrowStartX, arrowStartY, arrowEndX, arrowEndY];
  }

  // TODO: alterar de volta para seta.
  // Creates simple edge element.
  createArrowElement(
    identifier: string,
    originElement,
    targetElement,
    utterance: string
  ): fabric.Group {
    const coords = this.getArrowCoords(originElement, targetElement);
    // var arrowGroup = new fabric.Group(
    //[
    var arrow = new fabric.Line(coords, {
      stroke: '#908C8C',
      strokeWidth: 1.5,
    });
    /* new fabric.Triangle({
          width: 10,
          height: 15,
          fill: '#908C8C',
          left: coords[2] + 1,
          top: coords[3] - 5,
          angle: 90,
        }),
        new fabric.IText(utterance, {
          left: coords[2] - 3,
          top: coords[3] - 5,
          fontFamily: 'helvetica',
          angle: 0,
          fill: '#000000',
          scaleX: 0.5,
          scaleY: 0.5,
          fontSize: 30,
          hasRotatingPoint: true,
        }),*/
    // ],
    /* {
        id: identifier,
        type: EdgeTypeEnum.edge,
        hasBorders: false,
        hasControls: false,
      };*/
    //);

    arrow.id = identifier;
    arrow.type = EdgeTypeEnum.edge;
    arrow.hasBorders = false;
    arrow.hasControls = false;
    arrow.originElement = originElement;
    arrow.targetElement = targetElement;
    arrow.selectable = false;
    arrow.evented = false;

    originElement.line1.push(arrow);
    targetElement.line1.push(arrow);

    // console.log('originElement.line1', originElement.line1);
    //console.log('targetElement.line1', targetElement.line1);
    this.canvas.sendToBack(arrow);

    return arrow;
  }

  // TODO: propagar mudanças do arrow simples para cá.
  // Creates dashed edge element.
  createDashedArrowElement(
    identifier: string,
    originElement,
    targetElement,
    utterance: string
  ): fabric.Group {
    const coords = this.getArrowCoords(originElement, targetElement);
    //return new fabric.Group(
    // [
    var dashed_arrow = new fabric.Line(coords, {
      stroke: '#908C8C',
      strokeWidth: 1.5,
      strokeDashArray: [3, 3],
    });
    /* new fabric.Triangle({
          width: 10,
          height: 15,
          fill: '#908C8C',
          left: coords[2] + 1,
          top: coords[3] - 5,
          angle: 90,
        }),
        new fabric.IText(utterance, {
          left: coords[0] - 10,
          top: coords[3] - 5,
          fontFamily: 'helvetica',
          angle: 0,
          fill: '#000000',
          scaleX: 0.5,
          scaleY: 0.5,
          fontSize: 30,
          hasRotatingPoint: true,
        }),
      ],*/

    dashed_arrow.id = identifier;
    dashed_arrow.type = EdgeTypeEnum.dashed_edge;
    dashed_arrow.hasBorders = false;
    dashed_arrow.hasControls = false;
    dashed_arrow.originElement = originElement;
    dashed_arrow.targetElement = targetElement;
    dashed_arrow.selectable = false;
    dashed_arrow.evented = false;

    originElement.line1.push(dashed_arrow);
    targetElement.line1.push(dashed_arrow);

    this.canvas.sendToBack(dashed_arrow);

    return dashed_arrow;
    //);
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
          width: 100,
          height: 70,
          left: 10,
          top: 10,
          angle: 0,
          fill: '#fff',
          rx: 8,
          ry: 8,
          stroke: '#908C8C',
          strokeWidth: 1.5,
          hasControls: false,
          hasBorders: false,
        }),
        new fabric.Line([50, 200, 148.5, 200], {
          left: 11.5,
          top: 30,
          stroke: '#908C8C',
        }),
        new fabric.IText(sceneName, {
          left: 38,
          top: 14,
          fontFamily: 'helvetica',
          angle: 0,
          fill: '#000000',
          scaleX: 0.5,
          scaleY: 0.5,
          fontSize: 30,
          hasRotatingPoint: true,
        }),
        // TODO: começar no espaço mais a esquerda e cortar em um limite de letras.
        // colocar o diálogo e topics como hint.
        //Colocar como hint o id de todos os elementos.
        new fabric.IText(dialogs, {
          left: 38,
          top: 34,
          fontFamily: 'helvetica',
          angle: 0,
          fill: '#000000',
          scaleX: 0.5,
          scaleY: 0.5,
          fontSize: 30,
          hasRotatingPoint: true,
        }),
      ],
      {
        id: SimpleNodeTypeEnum.scene + ' - ' + identifier,
        type: SimpleNodeTypeEnum.scene,
        viewName: sceneName,
        hasBorders: false,
        hasControls: false,
        line1: [],
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
          width: 100,
          height: 70,
          left: 10,
          top: 10,
          angle: 0,
          fill: '#fff',
          rx: 8,
          ry: 8,
          stroke: '#908C8C',
          strokeDashArray: [5, 5],
          hasControls: false,
          hasBorders: false,
        }),
        new fabric.Line([50, 200, 148.5, 200], {
          left: 11.5,
          top: 30,
          stroke: '#908C8C',
          strokeDashArray: [5, 5],
        }),
        new fabric.IText(sceneName, {
          left: 38,
          top: 14,
          fontFamily: 'helvetica',
          angle: 0,
          fill: '#000000',
          scaleX: 0.5,
          scaleY: 0.5,
          fontSize: 30,
          hasRotatingPoint: true,
        }),
        new fabric.IText(dialogs, {
          left: 38,
          top: 34,
          fontFamily: 'helvetica',
          angle: 0,
          fill: '#000000',
          scaleX: 0.5,
          scaleY: 0.5,
          fontSize: 30,
          hasRotatingPoint: true,
        }),
      ],
      {
        id: SimpleNodeTypeEnum.dashed_scene + ' - ' + identifier,
        type: SimpleNodeTypeEnum.dashed_scene,
        viewName: sceneName,
        hasBorders: false,
        hasControls: false,
        line1: [],
      }
    );
  }

  // Creates end point element.
  createEndPointElement(identifier: string): fabric.Group {
    return new fabric.Group(
      [
        new fabric.Circle({
          radius: 15,
          left: 10,
          stroke: 'black',
          strokeWidth: 2,
          top: 10,
          fill: '#fff',
        }),
        new fabric.Circle({
          radius: 10,
          left: 15.5,
          top: 15.5,
          fill: '#000',
        }),
      ],
      {
        id: identifier,
        type: SimpleNodeTypeEnum.end_node,
        hasBorders: false,
        hasControls: false,
        line1: [],
      }
    );
  }

  // Creates start point element.
  createStartPointElement(identifier: string): fabric.Circle {
    return new fabric.Circle({
      id: identifier,
      type: SimpleNodeTypeEnum.start_node,
      radius: 15,
      left: 10,
      top: 10,
      fill: '#000',
      hasControls: false,
      hasBorders: false,
      line1: [],
    });
  }

  // Creates system process element.
  createProcessingBoxElement(identifier: string): fabric.Rect {
    var systemProcess = new fabric.Rect({
      id: identifier,
      type: SimpleNodeTypeEnum.system_process,
      width: 30,
      height: 30,
      left: 10,
      top: 10,
      angle: 0,
      fill: '#000',
      hasControls: false,
      hasBorders: false,
      line1: [],
    });

    this.canvas.bringToFront(systemProcess);
    return systemProcess;
  }

  // Creates ubiquitous element.
  createUbiquitousElement(identifier: string): fabric.Rect {
    var ubiquitous = new fabric.Rect({
      id: identifier,
      type: SimpleNodeTypeEnum.ubiquitous_acess,
      radius: 2,
      width: 100,
      height: 35,
      left: 10,
      top: 10,
      angle: 0,
      fill: '#DCD8D8',
      rx: 5,
      ry: 5,
      stroke: '#908C8C',
      strokeWidth: 1.5,
      hasControls: false,
      hasBorders: false,
      line1: [],
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

    this.viewScreen = 'elementsPanel';
    this.transitionalPropertiesFormGroup.reset();

    this.addElementToCanvas(
      this.connectTwoElements(
        this.getCurrentRenderingFigureId(),
        source,
        target,
        utterance
      )
    );
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
        let arrowUnderConstruction = this.canvas
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
