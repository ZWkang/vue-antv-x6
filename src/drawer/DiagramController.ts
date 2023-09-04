// import { Diagram, verticalTree } from '@tencent/tvision-t3';

import { DiagramBase } from './DiagramBase';

export const DEFAULT_VERTICAL_LAYOUT_SIZE = [190, 100];

export class DiagramController {
  get diagram() {
    return this.container.diagram;
  }
  constructor(public container: DiagramBase) { }

  zoomInit() {
    // this.diagram?.zoomController('zoomInit');
    this.diagram?.zoomTo(1);
  }
  zoomIn() {
    this.diagram?.zoomTo(1.2);
    // this.diagram?.zoomController('zoomIn');
  }
  zoomOut() {
    this.diagram?.zoomTo(0.8)
    // this.diagram?.zoomController('zoomOut');
  }

  verticalLayout(size: [number, number] = (DEFAULT_VERTICAL_LAYOUT_SIZE as [number, number])) {
    // const _size = size || [190, 100];
    // const _verticalLayout = verticalTree({ size: _size });
    // this.diagram?.layout(_verticalLayout);
  }
}
