import { Dnd } from '@antv/x6-plugin-dnd'


import { FeatureBase } from "./FeatureBase";
import type { Edge, EventArgs, Graph } from '@antv/x6'
import { Events } from '@antv/x6' 
import { MiniMap } from '@antv/x6-plugin-minimap'
import { DeleteALinkFeature } from './deleteALinkFeature';
import type { Button } from '@antv/x6/lib/registry/tool/button';

export const DeleteALink = 'DELETE_A_LINK';

const removeFn: Button.Options['onClick'] = ({ view, btn }) => {
  if(true) {
    //
    console.log('是否确认要删除节点')
  }
  btn.parent.remove();
  view.cell.remove({ ui: true, toolId: btn.cid });
}


// 删除线段的 feature
export class DeleteANodeFeature extends FeatureBase {
  static featureName = 'DeleteANodeFeature';
  static order = 'pre' as const;

  private templateDraggingNode: any = null;
  
  constructor(props: any) {
    super(props);
  }
  // 清理线段的数据
  cleanEdgePassThroughData(args: EventArgs['node:removed']) {
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

  }

  buttonRemoveEnterImpl(args: EventArgs['node:mouseenter']) {
    const { node } = args;
    if(node) {
      node.addTools([
        {
          name: 'button-remove',
          args: {
            x: '100%',
            y: 0,
            onClick: removeFn
          }
        }
      ])
    }
  }

  buttonRemoveLeaveImpl(args: EventArgs['node:mouseleave']) {
    const { node } = args;
    if(node) {
      node.removeTool('button-remove')
    }
  }
  

  install() {
    if(!this.diagram) return;
    this.diagram.on('node:removed', this.cleanEdgePassThroughData)
    this.diagram.on('node:mouseenter', this.buttonRemoveEnterImpl)
    this.diagram.on('node:mouseleave', this.buttonRemoveLeaveImpl)
  }

  uninstall() {
    if(!this.diagram) return;

    this.diagram.off('node:removed', this.cleanEdgePassThroughData);
    this.diagram.off('node:mouseenter', this.buttonRemoveEnterImpl)
    this.diagram.off('node:mouseleave', this.buttonRemoveLeaveImpl)
  }
}
