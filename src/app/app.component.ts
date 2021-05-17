import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'molic-editor';

  public createNewDiagram(): void {
    console.log('Creates new Diagram!');
  }

  public exportCurrentDiagram(): void {
    console.log('Exports current Diagram!');
  }

  public importNewDiagram(): void {
    console.log('Imports a new Diagram!');
  }

  public takeScreenshot(): void {
    console.log('Takes a screenshot of the Diagram');
  }
}
