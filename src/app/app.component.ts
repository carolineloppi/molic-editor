import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'molic-editor';

  public createNewDiagram(){
    console.log('Creates new Diagram!');
  }

  public exportCurrentDiagram(){
    console.log('Exports current Diagram!');
  }
  
  public importNewDiagram(){
    console.log('Imports a new Diagram!');
  }

  public takeScreenshot(){
    console.log('Takes a screenshot of the Diagram');
  }
}
