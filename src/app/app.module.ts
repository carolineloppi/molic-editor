import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ModalModule } from 'ngx-bootstrap/modal';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DraggableElementsPanelComponent } from './draggable-elements-panel/draggable-elements-panel.component';
import { DiagramPanelComponent } from './diagram-panel/diagram-panel.component';

@NgModule({
  declarations: [
    AppComponent,
    DraggableElementsPanelComponent,
    DiagramPanelComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    TooltipModule.forRoot(),
    ModalModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
