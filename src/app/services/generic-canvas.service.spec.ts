import { EdgeTypeEnum } from './../model/enums/edge-type';
import { TestBed } from '@angular/core/testing';

import { GenericCanvasService } from './generic-canvas.service';
import { fabric } from 'fabric';
import { SimpleNodeTypeEnum } from '../model/enums/simple-node-type';

describe('GenericCanvasService', () => {
  let canvasService: GenericCanvasService;
  let canvas;

  const textElement = new fabric.IText('Text element', {
    left: 10,
    top: 10,
    fontFamily: 'helvetica',
  });

  beforeEach(() => {
    TestBed.configureTestingModule({});
    canvasService = TestBed.inject(GenericCanvasService);

    // Recreates canvas object before each test case.
    canvas = canvasService.setupNewCanvas();
  });

  it('should be created', () => {
    expect(canvasService).toBeTruthy();
  });

  it('should setup a new canvas', () => {
    expect(canvas.hoverCursor).toBe('pointer');
    expect(canvas.selection).toBe(true);
    expect(canvas.selectionBorderColor).toBe('blue');
    expect(canvas.width).toBe(window.innerWidth);
    expect(canvas.height).toBe(1000);
  });

  it('should add element to canvas', () => {
    // Canvas is empty
    expect(canvas.getObjects().length).toBe(0);

    canvasService.addElementToCanvas(canvas, textElement);

    expect(canvas.getObjects().length).toBe(1);
    expect(canvas.getObjects()[0].text).toBe('Text element');
  });

  it('should remove element from canvas', () => {
    canvasService.addElementToCanvas(canvas, textElement);
    canvasService.removeElementFromCanvas(canvas, textElement);
    expect(canvas.getObjects().length).toBe(0);
  });

  it('should select element on canvas', () => {
    canvasService.addElementToCanvas(canvas, textElement);
    canvasService.selectCanvasObject(canvas, textElement);
    expect(canvas.getActiveObject()).toBe(textElement);
  });

  it('should clear canvas', () => {
    canvasService.addElementToCanvas(canvas, textElement);
    canvasService.clearCanvas(canvas);
    expect(canvas.getObjects().length).toBe(0);
  });

  it('should return canvas objects', () => {
    expect(canvasService.getCanvasObjects(canvas).length).toBe(0);
  });

  describe('on get connectable elements', () => {
    let testCanvas;

    beforeEach(() => {
      const element1 = new fabric.Group([], {
        type: SimpleNodeTypeEnum.conversation_closing,
      });
      const element2 = new fabric.Group([], {
        type: SimpleNodeTypeEnum.ubiquitous_acess,
      });

      testCanvas = new fabric.Canvas('canvas', {
        hoverCursor: 'pointer',
        selection: true,
        selectionBorderColor: 'blue',
      });
      testCanvas.setWidth(500);
      testCanvas.setHeight(500);

      testCanvas.add(element1);
      testCanvas.add(element2);
      testCanvas.add(element2);
    });
    it('should not have duplicates', () => {
      expect(canvasService.getConnectableElementsOnly(testCanvas).length).toBe(
        2
      );
    });

    it('should not have edge-type elements', () => {
      const element3 = new fabric.Group([], {
        type: EdgeTypeEnum.turn_giving,
      });

      testCanvas.add(element3);

      expect(canvasService.getConnectableElementsOnly(testCanvas).length).toBe(
        2
      );
    });
  });
});
