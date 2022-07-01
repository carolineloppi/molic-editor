import { Injectable } from '@angular/core';
import { SimpleNodeTypeEnum } from '../model/enums/simple-node-type';
import { fabric } from 'fabric';
import { GenericCanvasService } from './generic-canvas.service';

@Injectable({
  providedIn: 'root',
})
export class RenderNodeElementsService {
  constructor(private canvasService: GenericCanvasService) {}

  // Calls the canvas rendering functions for each non-edge element
  renderElement(
    elementId: string,
    currentRenderingFigure: any,
    elementsIdMap: any,
    topic?: string,
    description?: string
  ): any {
    if (!elementId) {
      return;
    }

    switch (currentRenderingFigure) {
      case SimpleNodeTypeEnum.scene:
        return this.createSceneElement(
          elementId,
          topic ? topic : '',
          description ? description : ''
        );
      case SimpleNodeTypeEnum.alert_scene:
        return this.createAlertSceneElement(
          elementId,
          topic ? topic : '',
          description ? description : ''
        );
      case SimpleNodeTypeEnum.ubiquitous_acess:
        return this.createUbiquitousElement(
          SimpleNodeTypeEnum.ubiquitous_acess +
            ' - ' +
            elementsIdMap.get(SimpleNodeTypeEnum.ubiquitous_acess)
        );
      case SimpleNodeTypeEnum.system_process:
        return this.createSystemProcessElement(
          SimpleNodeTypeEnum.system_process +
            ' - ' +
            elementsIdMap.get(SimpleNodeTypeEnum.system_process)
        );
      case SimpleNodeTypeEnum.conversation_opening:
        return this.createConversationOpeningElement(
          SimpleNodeTypeEnum.conversation_opening +
            ' - ' +
            elementsIdMap.get(SimpleNodeTypeEnum.conversation_opening)
        );
      case SimpleNodeTypeEnum.conversation_closing:
        return this.createConversationClosingElement(
          SimpleNodeTypeEnum.conversation_closing +
            ' - ' +
            elementsIdMap.get(SimpleNodeTypeEnum.conversation_closing)
        );
    }
  }

  // Creates Scene element.
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

  // Creates Alert Scene element.
  createAlertSceneElement(
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
        id: SimpleNodeTypeEnum.alert_scene + ' - ' + identifier,
        type: SimpleNodeTypeEnum.alert_scene,
        viewName: sceneName,
        hasBorders: false,
        hasControls: false,
        lines: [],
      }
    );
  }

  // Creates Conversation Closing element.
  createConversationClosingElement(identifier: string): fabric.Group {
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
        type: SimpleNodeTypeEnum.conversation_closing,
        hasBorders: false,
        hasControls: false,
        lines: [],
      }
    );
  }

  // Creates Conversation Opening element.
  createConversationOpeningElement(identifier: string): fabric.Circle {
    return new fabric.Circle({
      id: identifier,
      type: SimpleNodeTypeEnum.conversation_opening,
      radius: 15,
      left: 120,
      top: 60,
      fill: '#000',
      hasControls: false,
      hasBorders: false,
      lines: [],
    });
  }

  // Creates System Process element.
  createSystemProcessElement(identifier: string): fabric.Rect {
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

    return systemProcess;
  }

  // Creates Ubiquitous element.
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

    return ubiquitous;
  }

  // Renders Scene type elements and adds it to canvas.
  createSceneWithAdditionalProperties(
    canvas: any,
    formData,
    currentRenderingFigureId,
    currentRenderingFigure,
    elementsIdMap
  ): void {
    const topicKey = 'topic';
    const dialogsKey = 'dialogs';

    const topic = formData[topicKey];
    const dialogs = formData[dialogsKey];

    // create element
    this.canvasService.addElementToCanvas(
      canvas,
      this.renderElement(
        currentRenderingFigureId,
        currentRenderingFigure,
        elementsIdMap,
        topic,
        dialogs
      )
    );
  }

  // Renders non-Turn Giving and non-Scene element and adds it to canvas.
  createSimpleElement(
    canvas: any,
    currentRenderingFigureId: string,
    currentRenderingFigure: any,
    elementsIdMap: any
  ): void {
    this.canvasService.addElementToCanvas(
      canvas,
      this.renderElement(
        currentRenderingFigureId,
        currentRenderingFigure,
        elementsIdMap
      )
    );
  }
}
