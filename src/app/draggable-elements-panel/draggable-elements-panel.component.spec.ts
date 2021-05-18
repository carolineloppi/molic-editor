import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DraggableElementsPanelComponent } from './draggable-elements-panel.component';

describe('DraggableElementsPanelComponent', () => {
  let component: DraggableElementsPanelComponent;
  let fixture: ComponentFixture<DraggableElementsPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DraggableElementsPanelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DraggableElementsPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
