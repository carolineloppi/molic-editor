import { ConnectElementsService } from './services/connect-elements.service';
import { RenderNodeElementsService } from './services/render-node-elements.service';
import { GenericCanvasService } from './services/generic-canvas.service';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { BrowserModule } from '@angular/platform-browser';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DiagramPanelComponent } from './diagram-panel/diagram-panel.component';

const canvasService: GenericCanvasService = new GenericCanvasService();
const renderNodeElementsService: RenderNodeElementsService =
  new RenderNodeElementsService(canvasService);
const connectElementsService: ConnectElementsService =
  new ConnectElementsService(canvasService);

@NgModule({
  declarations: [AppComponent, DiagramPanelComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    TooltipModule.forRoot(),
    ModalModule.forRoot(),
  ],
  providers: [
    {
      provide: GenericCanvasService,
      useValue: canvasService,
    },
    {
      provide: RenderNodeElementsService,
      useValue: renderNodeElementsService,
    },
    {
      provide: ConnectElementsService,
      useValue: connectElementsService,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
