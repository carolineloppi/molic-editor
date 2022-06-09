import { DiagramPanelComponent } from './diagram-panel/diagram-panel.component';
/**
 * @author Caroline Loppi
 * @email carolineloppi@outlook.com
 * @create date 2021-05-17 13:44:05
 * @modify date 2021-05-17 13:44:05
 * @desc AppComponent Class has the functions related to the main program screen.
 */

import { Component, ViewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  @ViewChild(DiagramPanelComponent) diagramPanel: DiagramPanelComponent;
  title = 'molic-editor';

  /**
   * Allow the user to create a diagram from scratch.
   */
  public createNewDiagram(): void {
    console.log('Canvas will be reseted!');
    if (!this.diagramPanel) {
      return;
    }
    this.diagramPanel.clearCanvas();
  }
  /**
   * Allow the user to save locally the current diagram under construction.
   */
  public exportCurrentDiagram(): void {
    console.log('Exports current Diagram!');
  }

  /**
   * Allow the user to open an existing diagram and continue editing it.
   */
  public importNewDiagram(): void {
    console.log('Imports a new Diagram!');
  }

  /**
   * Allow the user to save a screenshot of the diagram.
   */
  public takeScreenshot(): void {
    console.log('Takes a screenshot of the Diagram');
  }
}
