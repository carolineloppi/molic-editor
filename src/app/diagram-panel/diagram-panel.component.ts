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

  extend(obj, id) {
    obj.toObject = (function (toObject) {
      return function () {
        return fabric.util.object.extend(toObject.call(this), {
          id: id,
        });
      };
    })(obj.toObject);
  }
  //======= this is used to generate random id of every object ===========
  randomId() {
    return Math.floor(Math.random() * 999999) + 1;
  }
  //== this function is used to active the object after creation ==========
  selectItemAfterAdded(obj) {
    this.canvas.discardActiveObject().renderAll();
    this.canvas.setActiveObject(obj);
  }

  //Creates the selected element and add to Canvas.
  addElement(figure) {
    let add: any;
    switch (figure) {
      case 'arrow':
        add = this.createArrowElement();
        break;
      case 'dashed-arrow':
        add = this.createDashedArrowElement();
        break;
      case 'scene':
        add = this.createSceneElement();
        break;
      case 'dashed-scene':
        add = this.createDashedSceneElement();
        break;

      case 'ubiquitous':
        add = this.createUbiquitousElement();
        break;
      case 'processing-box':
        add = this.createProcessingBoxElement();
        break;
      case 'start-point':
        add = this.createStartPointElement();
        break;
      case 'end-point':
        add = this.createEndPointElement();
        break;
    }
    this.extend(add, this.randomId());
    this.canvas.add(add);
    this.selectItemAfterAdded(add);
  }

  createArrowElement() {
    return new fabric.Group(
      [
        new fabric.Line([50, 200, 148.5, 200], {
          left: 10,
          top: 30,
          stroke: '#908C8C',
          strokeWidth: 1.5,
        }),
        new fabric.Triangle({
          width: 10,
          height: 15,
          fill: '#908C8C',
          left: 120,
          top: 25,
          angle: 90,
        }),
      ],
      { hasBorders: false, hasControls: false }
    );
  }

  createDashedArrowElement() {
    return new fabric.Group(
      [
        new fabric.Line([50, 200, 148.5, 200], {
          left: 10,
          top: 30,
          stroke: '#908C8C',
          strokeWidth: 1.5,
          strokeDashArray: [3, 3],
        }),
        new fabric.Triangle({
          width: 10,
          height: 15,
          fill: '#908C8C',
          left: 120,
          top: 25,
          angle: 90,
        }),
      ],
      { hasBorders: false, hasControls: false }
    );
  }

  createSceneElement() {
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
      { hasBorders: false, hasControls: false }
    );
  }

  createDashedSceneElement() {
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
      { hasBorders: false, hasControls: false }
    );
  }

  createEndPointElement() {
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
      { hasBorders: false, hasControls: false }
    );
  }

  createStartPointElement() {
    return new fabric.Circle({
      radius: 15,
      left: 10,
      top: 10,
      fill: '#000',
      hasControls: false,
      hasBorders: false,
    });
  }

  createProcessingBoxElement() {
    return new fabric.Rect({
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

  createUbiquitousElement() {
    return new fabric.Rect({
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
}
