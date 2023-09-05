import { Dnd } from '@antv/x6-plugin-dnd'


import { FeatureBase } from "./FeatureBase";
import type { EventArgs, Graph } from '@antv/x6'
import { Events } from '@antv/x6' 
import { MiniMap } from '@antv/x6-plugin-minimap'

// 鼠标 hover 上去有个删除标记
export class DeleteALinkFeature extends FeatureBase {
  static featureName = 'DeleteALinkFeature';
  static order = 'pre' as const;

  private templateDraggingNode: any = null;
  
  constructor(props: any) {
    super(props);
  }

  public startDrag(e: any, nodeData: any) {
    if(!this.events || !this.dnd) return;
    const node = this.container.diagram?.createNode(nodeData);
    this.events.trigger('start-drag', node);
    this.dnd.start(node!, e.nativeEvent);


    const draggingNode = document.querySelector('.dragging')
    this.templateDraggingNode = draggingNode;

    if(!draggingNode) return;

    const handleDragMove = (e) => {
      const { clientX, clientY } = e;
      this.events!.trigger('drag-move', {
        event: e,
        x: this.container.diagram?.clientToLocal(clientX, clientY).x,
        y: this.container.diagram?.clientToLocal(clientX, clientY).y,
      });
    }

    const handleDragUp= () => {
      this.events!.trigger('end-drag', node);
      document.removeEventListener('mousemove', handleDragMove)
      draggingNode.removeEventListener('mouseup', handleDragUp)
    }

    document.addEventListener('mousemove', handleDragMove)
    draggingNode.addEventListener('mouseup', handleDragUp)
  }

  install() {
  }

  uninstall() {
    this.dnd = null;
    this.events = null;

    this.templateDraggingNode = null
  }
}