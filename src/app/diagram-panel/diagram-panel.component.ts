import { identifierModuleUrl } from '@angular/compiler';
import { Component, Input, OnInit } from '@angular/core';
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

  private size: any = {
    width: 1200,
    height: 1000,
  };

  constructor() {}

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
  }

  // Selects the object on Canvas.
  selectCanvasObject(obj): void {
    this.canvas.discardActiveObject().renderAll();
    this.canvas.setActiveObject(obj);
  }

  // Creates the selected element and adds it to Canvas.
  addElement(figure): void {
    let newElement: any;
    switch (figure) {
      case 'arrow':
        newElement = this.connectTwoElements(
          'arrow',
          'scene1',
          'processamento1'
        );
        break;
      case 'dashed-arrow':
        newElement = this.connectTwoElements(
          'dashed-arrow',
          'ubiquitous1',
          'startPoint1'
        );
        break;
      case 'scene':
        newElement = this.createSceneElement('scene1');
        break;
      case 'dashed-scene':
        newElement = this.createDashedSceneElement('dashedScene1');
        break;
      case 'ubiquitous':
        newElement = this.createUbiquitousElement('ubiquitous1');
        break;
      case 'processing-box':
        newElement = this.createProcessingBoxElement('processamento1');
        break;
      case 'start-point':
        newElement = this.createStartPointElement('startPoint1');
        break;
      case 'end-point':
        newElement = this.createEndPointElement('endPoint1');
        break;
    }
    if (newElement) {
      this.canvas.add(newElement);
      this.selectCanvasObject(newElement);
    }
  }

  connectTwoElements(
    arrowType: string,
    originElementId: string,
    targetElementId: string
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

    console.log('origin', origin);
    console.log('target', target);

    if (!origin) {
      console.log('Origin element is not available to connect with');
      return;
    }

    if (!target) {
      console.log('Target element is not available to connect with');
      return;
    }

    let arrow: fabric.Group;
    switch (arrowType) {
      case 'dashed-arrow':
        arrow = this.createDashedArrowElement(origin, target);
        break;
      case 'arrow':
        arrow = this.createArrowElement(origin, target);
        break;
    }

    return arrow;
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

  createArrowElement(originElement, targetElement): fabric.Group {
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
      ],
      { hasBorders: false, hasControls: false }
    );
  }

  createDashedArrowElement(originElement, targetElement): fabric.Group {
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
      ],
      { hasBorders: false, hasControls: false }
    );
  }

  createSceneElement(sceneName: string): fabric.Group {
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
        new fabric.IText('Scene', {
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
      ],
      { id: sceneName, hasBorders: false, hasControls: false }
    );
  }

  createDashedSceneElement(sceneName: string): fabric.Group {
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
        new fabric.IText('Scene', {
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
    this.canvas.clear();
  }
}
