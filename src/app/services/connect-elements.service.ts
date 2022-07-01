import { Injectable } from '@angular/core';
import { GenericCanvasService } from './generic-canvas.service';

import { fabric } from 'fabric';
import { EdgeTypeEnum } from '../model/enums/edge-type';

@Injectable({
  providedIn: 'root',
})
export class ConnectElementsService {
  constructor(private canvasService: GenericCanvasService) {}

  // Renders Turn Giving type elements and adds it to canvas.
  createTransitionalElement(
    canvas,
    formData,
    currentRenderingFigureId,
    currentRenderingFigure
  ): void {
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

    if (source === target) {
      alert('Source and target nodes should be different');
      return;
    }

    const arrowContent: fabric.any[] = this.connectTwoElements(
      canvas,
      currentRenderingFigureId,
      currentRenderingFigure,
      source,
      target,
      utterance
    );

    if (!arrowContent) {
      return;
    }

    arrowContent.forEach((element) => {
      this.canvasService.addElementToCanvas(canvas, element);
    });
  }

  // Connects two node elements.
  connectTwoElements(
    canvas,
    elementId: string,
    currentRenderingFigure: any,
    originElementId: string,
    targetElementId: string,
    utterance: string
  ): fabric.any[] {
    if (canvas.getObjects().length < 2) {
      console.log('There are not enough elements to create a connection');
      return;
    }

    const origin: fabric.Group = canvas
      .getObjects()
      .filter((el) => el.id === originElementId)[0];

    const target: fabric.Group = canvas
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

    switch (currentRenderingFigure) {
      case EdgeTypeEnum.breakdown_recovery_turn_giving:
        return this.createBreakdownRecoveryElement(
          elementId,
          origin,
          target,
          utterance ? utterance : ''
        );
      case EdgeTypeEnum.turn_giving:
        return this.createTurnGivingElement(
          elementId,
          origin,
          target,
          utterance ? utterance : ''
        );
    }
  }

  // Creates Turn Giving element.
  createTurnGivingElement(
    identifier: string,
    originElement,
    targetElement,
    utterance: string
  ): fabric.any[] {
    const coords = this.canvasService.getArrowCoords(
      originElement,
      targetElement
    );

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
      angle: this.canvasService.calcArrowAngle(
        coords[0],
        coords[1],
        coords[2],
        coords[3]
      ),
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
    line.type = EdgeTypeEnum.turn_giving;
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

  // Creates Breakdown Recovery Turn Giving element.
  createBreakdownRecoveryElement(
    identifier: string,
    originElement,
    targetElement,
    utterance: string
  ): fabric.any[] {
    const coords = this.canvasService.getArrowCoords(
      originElement,
      targetElement
    );

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
      angle: this.canvasService.calcArrowAngle(
        coords[0],
        coords[1],
        coords[2],
        coords[3]
      ),
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
    dashedLine.type = EdgeTypeEnum.breakdown_recovery_turn_giving;
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
}
