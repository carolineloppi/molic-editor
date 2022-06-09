import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { fabric } from 'fabric';

@Component({
  selector: 'app-diagram-panel',
  templateUrl: './diagram-panel.component.html',
  styleUrls: ['./diagram-panel.component.css'],
})
export class DiagramPanelComponent implements OnInit {
  private canvas: any;
  textString: string;
  outputContent: string;
  viewScreen: string;
  additionalPropertiesFormGroup;
  transitionalPropertiesFormGroup;
  currentRenderingFigure: any;

  private size: any = {
    width: 1200,
    height: 1000,
  };

  // TODO: atualizar ao carregar o XML.

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

    this.elementsIdMap.set('ubiquitous', 0);
    this.elementsIdMap.set('processing-box', 0);
    this.elementsIdMap.set('start-point', 0);
    this.elementsIdMap.set('end-point', 0);
  }

  ngOnInit(): void {
    this.canvas = new fabric.Canvas('canvas', {
      hoverCursor: 'pointer',
      selection: true,
      selectionBorderColor: 'blue',
    });
    this.textString = null;
    this.canvas.setWidth(this.size.width);
    this.canvas.setHeight(this.size.height);
    this.outputContent = null;
    this.viewScreen = 'elementsPanel';
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
      case 'arrow':
      case 'dashed-arrow':
        this.viewScreen = 'transitionPropertiesPanel';
        break;

      case 'scene':
      case 'dashed-scene':
        this.viewScreen = 'additionalPropertiesPanel';
        break;

      default:
        this.createSimpleElement();
        return;
    }

    // TODO: criar node e edge e adicionar aos arrays do diagram.ts
  }

  renderElement(elementId: string, description?: string): any {
    if (!elementId) {
      return;
    }

    switch (this.currentRenderingFigure) {
      case 'scene':
        return this.createSceneElement(
          elementId,
          description ? description : ''
        );
      case 'dashed-scene':
        return this.createDashedSceneElement(
          elementId,
          description ? description : ''
        );
      case 'ubiquitous':
        return this.createUbiquitousElement(
          'Ubiquitous - ' + this.elementsIdMap.get('ubiquitous')
        );
      case 'processing-box':
        return this.createProcessingBoxElement(
          'Processing Box - ' + this.elementsIdMap.get('processing-box')
        );
      case 'start-point':
        return this.createStartPointElement(
          'Start Point - ' + this.elementsIdMap.get('start-point')
        );
      case 'end-point':
        return this.createEndPointElement(
          'End Point - ' + this.elementsIdMap.get('end-point')
        );
    }
  }

  updateIdMapCount(elementType: string): void {
    const currentValue: number = this.elementsIdMap.get(elementType);
    this.elementsIdMap.set(elementType, currentValue + 1);
  }

  connectTwoElements(
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
      case 'dashed-arrow':
        return this.createDashedArrowElement(origin, target, utterance);
      case 'arrow':
        return this.createArrowElement(origin, target, utterance);
    }
  }

  getArrowCoords(originElement, targetElement): number[] {
    console.log('originElement', originElement);
    console.log('targetElement', targetElement);

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

    console.log('Start Arrow X: ', arrowStartX);
    console.log('Start Arrow Y: ', arrowStartY);

    console.log('End Arrow X: ', arrowEndX);
    console.log('End Arrow Y: ', arrowEndY);

    return [arrowStartX, arrowStartY, arrowEndX, arrowEndY];
  }

  createArrowElement(
    originElement,
    targetElement,
    utterance: string
  ): fabric.Group {
    const coords = this.getArrowCoords(originElement, targetElement);
    return new fabric.Group(
      [
        new fabric.Line(coords, {
          stroke: '#908C8C',
          strokeWidth: 1.5,
        }),
        new fabric.Triangle({
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
        }),
      ],
      { hasBorders: false, hasControls: false }
    );
  }

  createDashedArrowElement(
    originElement,
    targetElement,
    utterance: string
  ): fabric.Group {
    const coords = this.getArrowCoords(originElement, targetElement);
    return new fabric.Group(
      [
        new fabric.Line(coords, {
          stroke: '#908C8C',
          strokeWidth: 1.5,
          strokeDashArray: [3, 3],
        }),
        new fabric.Triangle({
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
      ],
      { hasBorders: false, hasControls: false }
    );
  }

  createSceneElement(sceneName: string, dialogs: string): fabric.Group {
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
      { id: sceneName, hasBorders: false, hasControls: false }
    );
  }

  createDashedSceneElement(sceneName: string, dialogs: string): fabric.Group {
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
      { id: sceneName, hasBorders: false, hasControls: false }
    );
  }

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
      { id: identifier, hasBorders: false, hasControls: false }
    );
  }

  createStartPointElement(identifier: string): fabric.Circle {
    return new fabric.Circle({
      id: identifier,
      radius: 15,
      left: 10,
      top: 10,
      fill: '#000',
      hasControls: false,
      hasBorders: false,
    });
  }

  createProcessingBoxElement(identifier: string): fabric.Rect {
    return new fabric.Rect({
      id: identifier,
      width: 30,
      height: 30,
      left: 10,
      top: 10,
      angle: 0,
      fill: '#000',
      hasControls: false,
      hasBorders: false,
    });
  }

  createUbiquitousElement(identifier: string): fabric.Rect {
    return new fabric.Rect({
      id: identifier,
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
    });
  }

  // Remove all elements from Canvas.
  public clearCanvas(): void {
    if (this.canvas) {
      this.canvas.clear();
    }
  }

  createSceneWithAdditionalProperties(formData): void {
    const topicKey = 'topic';
    const dialogsKey = 'dialogs';

    const topic = formData[topicKey];
    const dialogs = formData[dialogsKey];

    // create element
    this.viewScreen = 'elementsPanel';
    this.additionalPropertiesFormGroup.reset();
    this.addElementToCanvas(this.renderElement(topic, dialogs));
  }

  createTransitionalElement(formData): void {
    const sourceKey = 'source';
    const targetKey = 'target';
    const utteranceKey = 'utterance';

    const source = formData[sourceKey];
    const target = formData[targetKey];
    const utterance = formData[utteranceKey];

    this.viewScreen = 'elementsPanel';
    this.transitionalPropertiesFormGroup.reset();
    this.addElementToCanvas(this.connectTwoElements(source, target, utterance));
  }

  createSimpleElement(): void {
    const elementId = this.elementsIdMap.get(this.currentRenderingFigure);

    this.updateIdMapCount(this.currentRenderingFigure);
    this.addElementToCanvas(this.renderElement(elementId.toString()));
  }

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
        break;

      case 'transitionalProperties':
        this.transitionalPropertiesFormGroup.reset();
        break;
    }

    this.canvas.remove(this.canvas.getActiveObject());
    this.viewScreen = 'elementsPanel';
  }
}
