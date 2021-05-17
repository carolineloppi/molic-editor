import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [
        AppComponent
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'molic-editor'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('molic-editor');
  });

  it('should call createNewDiagram when new button is clicked', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    //Spies on the createNewDiagram method
    spyOn(app,'createNewDiagram').and.callThrough();
    
    //Click the newDiagram Button
    let button = document.getElementById('newDiagram');
    button.click();

    //Check if the method createNewDiagram was called (once) after clicking the newDiagram button
    expect(app.createNewDiagram).toHaveBeenCalled();
    expect(app.createNewDiagram).toHaveBeenCalledTimes(1);

  });

  it('should call exportCurrentDiagram when export button is clicked', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    //Spies on the exportCurrentDiagram method
    spyOn(app,'exportCurrentDiagram').and.callThrough();
    
    //Click the exportDiagram Button
    let button = document.getElementById('exportDiagram');
    button.click();

    //Check if the method exportCurrentDiagram was called (once) after clicking the exportDiagram button
    expect(app.exportCurrentDiagram).toHaveBeenCalled();
    expect(app.exportCurrentDiagram).toHaveBeenCalledTimes(1);

  });

  it('should call importNewDiagram when import button is clicked', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    //Spies on the importNewDiagram method
    spyOn(app,'importNewDiagram').and.callThrough();

    //Click the importDiagram Button
    let button = document.getElementById('importDiagram');
    button.click();

    //Check if the method importNewDiagram was called (once) after clicking the importDiagram button
    expect(app.importNewDiagram).toHaveBeenCalled();
    expect(app.importNewDiagram).toHaveBeenCalledTimes(1);

  });

  it('should call takeScreenshot when screenshot button is clicked', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    //Spies on the takeScreenshot method
    spyOn(app,'takeScreenshot').and.callThrough();

    //Click the screenshot Button
    let button = document.getElementById('screenshot');
    button.click();

    //Check if the method takeScreenshot was called (once) after clicking the screenshot button
    expect(app.takeScreenshot).toHaveBeenCalled();
    expect(app.takeScreenshot).toHaveBeenCalledTimes(1);
    
  });

});
