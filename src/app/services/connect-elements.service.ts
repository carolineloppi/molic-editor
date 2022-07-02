import { Injectable } from '@angular/core';
import { GenericCanvasService } from './generic-canvas.service';

import { fabric } from 'fabric';
import { EdgeTypeEnum } from '../model/enums/edge-type';

@Injectable({
  providedIn: 'root',
})
export class ConnectElementsService {
  sourceKey = 'source';
  targetKey = 'target';
  utteranceKey = 'utterance';

  formData;

  constructor(private canvasService: GenericCanvasService) {}

  getSource(): any {
    return this.formData[this.sourceKey];
  }
  getTarget(): any {
    return this.formData[this.targetKey];
  }

  getUtterance(): any {
    return this.formData[this.utteranceKey];
  }

  // Renders Turn Giving type elements and adds it to canvas.
  createTransitionalElement(
    canvas,
    formData,
    currentRenderingFigureId,
    currentRenderingFigure
  ): void {
    this.formData = formData;
    const source = this.getSource();
    const target = this.getTarget();
    const utterance = this.getUtterance();

    if (!source || !target) {
      this.showErrorMessage('Select both source and target nodes');
      return;
    }

    if (source === target) {
      this.showErrorMessage('Source and target nodes should be different');
      return;
    }

    const connection = this.connectTwoElements(
      canvas,
      currentRenderingFigureId,
      currentRenderingFigure,
      source,
      target,
      utterance
    );

    if (!connection) {
      return;
    }

    connection.forEach((element) => {
      this.canvasService.addElementToCanvas(canvas, element);
    });
  }

  // Check if canvas has at least two elements to be connected
  validateCanvasContent(canvas): boolean {
    if (this.canvasService.getCanvasObjects(canvas).length < 2) {
      this.showErrorMessage(
        'There are not enough elements to create a connection'
      );
      return false;
    }
    return true;
  }

  validateOriginElement(canvas, originElementId): any {
    const origin = this.canvasService.getCanvasElementById(
      canvas,
      originElementId
    );

    if (!origin) {
      this.showErrorMessage('Origin element is not available to connect with');
      return undefined;
    }
    return origin;
  }

  validateTargetElement(canvas, targetElementId): any {
    const target = this.canvasService.getCanvasElementById(
      canvas,
      targetElementId
    );

    if (!target) {
      this.showErrorMessage('Target element is not available to connect with');
      return undefined;
    }
    return target;
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
    if (!this.validateCanvasContent(canvas)) {
      return;
    }
    const originElement = this.validateOriginElement(canvas, originElementId);

    const targetElement = this.validateTargetElement(canvas, targetElementId);

    if (!originElement || !targetElement) {
      return;
    }

    switch (currentRenderingFigure) {
      case EdgeTypeEnum.breakdown_recovery_turn_giving:
        return this.createBreakdownRecoveryElement(
          elementId,
          originElement,
          targetElement,
          utterance ? utterance : ''
        );
      case EdgeTypeEnum.turn_giving:
        return this.createTurnGivingElement(
          elementId,
          originElement,
          targetElement,
          utterance ? utterance : ''
        );
    }
  }

  showErrorMessage(errorMessage: string): void {
    alert(errorMessage);
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
