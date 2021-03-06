import { Injectable } from '@angular/core';
import { fabric } from 'fabric';
import { SimpleNodeTypeEnum } from '../model/enums/simple-node-type';

@Injectable({
  providedIn: 'root',
})
export class GenericCanvasService {
  // Canvas default size.
  private size: any = {
    width: window.innerWidth,
    height: 1000,
  };

  private connectableTypes = [
    SimpleNodeTypeEnum.alert_scene,
    SimpleNodeTypeEnum.scene,
    SimpleNodeTypeEnum.conversation_opening,
    SimpleNodeTypeEnum.conversation_closing,
    SimpleNodeTypeEnum.system_process,
    SimpleNodeTypeEnum.ubiquitous_acess,
  ];

  constructor() {}

  setupNewCanvas(): any {
    const canvas = new fabric.Canvas('canvas', {
      hoverCursor: 'pointer',
      selection: true,
      selectionBorderColor: 'blue',
    });
    canvas.setWidth(this.size.width);
    canvas.setHeight(this.size.height);

    return canvas;
  }

  // Adds an element to canvas and select it.
  addElementToCanvas(canvas: any, newElement: any): void {
    if (newElement) {
      canvas.add(newElement);
      this.selectCanvasObject(canvas, newElement);
    }
  }

  // Return element with elementId on canvas.
  getCanvasElementById(canvas: any, elementId: string): any {
    return canvas.getObjects().filter((el) => el.id === elementId)[0];
  }

  // Remove a specific element from canvas.
  removeElementFromCanvas(canvas: any, elementToRemove: any): void {
    canvas.remove(elementToRemove);
  }

  // Remove a specific element from canvas.
  removeActiveElementFromCanvas(canvas: any): void {
    canvas.remove(canvas.getActiveObject());
  }

  // Selects the object on Canvas.
  selectCanvasObject(canvas: any, obj): void {
    canvas.discardActiveObject().renderAll();
    canvas.setActiveObject(obj);
  }

  // Remove any element on canvas.
  clearCanvas(canvas: any): void {
    if (canvas) {
      canvas.clear();
    }
  }

  // Return all objects drawn on canvas.
  getCanvasObjects(canvas: any): any[] {
    return canvas.getObjects();
  }

  getConnectableElementsOnly(canvas: any): any[] {
    const canvasObjects: any[] = this.getCanvasObjects(canvas);
    const elementsArray = Array.isArray(canvasObjects)
      ? canvasObjects.filter((el) => this.connectableTypes.includes(el.type))
      : [];

    // TODO VERSION2: Since this array is currently with duplicates, it's being filtered for unique id values.
    return [...new Set(elementsArray)];
  }

  setDefaultMouseMoveBehaviour(canvas): void {
    // Reposition element and connection when moving
    canvas.on('mouse:move', (e) => {
      this.updateConnectionPosition(canvas, e);
      canvas.renderAll();
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

  // Return connection element start and end coordinates.
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

  // Updates connection position based on origin and target elements positions.
  updateConnectionPosition(canvas: any, targetElement: any): void {
    if (!canvas.getActiveObject() || targetElement.target == null) {
      return;
    }

    if (targetElement.target !== canvas.getActiveObject()) {
      return;
    }
    const p = targetElement.target;
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

        if (targetElement.target === line.originElement) {
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

        canvas.sendToBack(line.line);

        canvas.requestRenderAll();
      }
    });
  }
}
