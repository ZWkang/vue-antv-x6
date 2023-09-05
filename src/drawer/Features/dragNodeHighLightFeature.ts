import { Dnd } from '@antv/x6-plugin-dnd'


import { FeatureBase } from "./FeatureBase";
import type { EventArgs, Graph, Node } from '@antv/x6'
import { MiniMap } from '@antv/x6-plugin-minimap'
import { DragAutoLinkFeature } from './DragAutoLink';
import { DragFeature } from './drag';


// 快捷连线时的锚点高亮显示

// 暂时可以只让锚点高亮。但是实际上需要有一条虚拟连接线展示较好，可以暂时不做。
export class DragNodeHighLightFeature extends FeatureBase {
  static featureName = 'DragNodeHighLightFeature';
  static order = 'pre' as const;

  private lastOneConnectingLoadingNode: Node<Node.Properties> | null = null
  private lastOneConnectingPortStyle: Record<string, any> | null = null

  private resetNodeAnchorState() {
    if(!this.lastOneConnectingPortStyle) return;
    this.lastOneConnectingLoadingNode?.updateAttrs(this.lastOneConnectingPortStyle)
  }

  private handleDragEnd() {
    this.resetNodeAnchorState();
  }
  
  private handleStartDragging(node: Node) {

    const connectNode = this.container.featureManager.getPlugin(DragAutoLinkFeature)?.getPrepareConnectNode(node);
    const connectPort = this.container.featureManager.getPlugin(DragAutoLinkFeature)?.getPrepareConnectPort(node);

    if(connectNode && connectPort) {
      const connectedNode = this.container.diagram?.getCellById(connectNode.id)
      if(connectedNode && connectNode.isNode()) {
        this.resetNodeAnchorState();
        this.lastOneConnectingLoadingNode = connectedNode as Node<Node.Properties>;
        // 高亮闪烁！
      };
    }
  }

  private prepareEvent() {
    this.container.featureManager.getPlugin(DragFeature)?.events?.on('drag-move', this.handleStartDragging)
    this.container.featureManager.getPlugin(DragFeature)?.events?.on('drag-end', this.handleDragEnd)
  }

  install() {
    this.prepareEvent();
  }

  uninstall() {
    this.container.featureManager.getPlugin(DragFeature)?.events?.off('drag-move', this.handleStartDragging)
    this.container.featureManager.getPlugin(DragFeature)?.events?.off('drag-end', this.handleDragEnd)
  }
}