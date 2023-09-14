import { Dnd } from '@antv/x6-plugin-dnd'


import { FeatureBase } from "./FeatureBase";
import type { Edge, EventArgs, Graph } from '@antv/x6'
import { Events } from '@antv/x6' 
import { MiniMap } from '@antv/x6-plugin-minimap'
import { DeleteALinkFeature } from './deleteALinkFeature';

export const DeleteALink = 'DELETE_A_LINK';

// 删除线段的 feature
export class DeleteANodeFeature extends FeatureBase {
  static featureName = 'DeleteALinkFeature';
  static order = 'pre' as const;

  private templateDraggingNode: any = null;
  
  constructor(props: any) {
    super(props);
  }
  // 清理线段的数据
  cleanEdgePassThroughData(args: EventArgs['edge:removed']) {
    const { cell } = args;
    if(!cell.isNode()) return;

    // const outcomingEdges = cell.getOutgoingEdges();
    const allOutGoingEdges = this.container.diagram?.getOutgoingEdges(cell);
    if(!allOutGoingEdges) return;


    // 所有链接线进行一次清除
    allOutGoingEdges.forEach((edge) => {
      this.container.featureManager.getPlugin(DeleteALinkFeature)?.cleanEdgePassThroughData({
        edge
      })
    })

    // this.container.diagram?.removeNode(cell);      
  }
  

  install() {
    this.container.on('node:removed', this.cleanEdgePassThroughData)
  }

  uninstall() {
    this.container.off('node:removed', this.cleanEdgePassThroughData);
  }
}