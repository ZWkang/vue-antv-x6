import { Dnd } from '@antv/x6-plugin-dnd'


import { FeatureBase } from "./FeatureBase";
import { Graph, type Edge, type EventArgs } from '@antv/x6'
import { Events } from '@antv/x6' 
import { MiniMap } from '@antv/x6-plugin-minimap'

export const DeleteALink = 'DELETE_A_LINK';

// 删除线段的 feature
export class DeleteALinkFeature extends FeatureBase {
  static featureName = 'DeleteALinkFeature';
  static order = 'pre' as const;

  private templateDraggingNode: any = null;
  
  constructor(props: any) {
    super(props);
  }
  // 清理线段的数据
  cleanEdgePassThroughData(args: Pick<EventArgs['edge:removed'], 'edge'>) {
    const { edge } = args;
    // const edge = cell;
    // 如果不是线段 麻烦滚粗
    if(!edge.isEdge()) {
      return;
    }
    // edge.getSource();
    const sourceNode = edge.getSourceNode();
    const targetNode = edge.getTargetNode();
    const sourcePort = edge.getSourcePortId(); // node_id + anchor + position
    const targetPort = edge.getTargetPortId();

    if(!sourceNode || !sourcePort || !targetNode || !targetPort) {
      return;
    }

    const [, key, position] = sourcePort.split(':')

    const sourceData = sourceNode.getData();
    const targetData = targetNode.getData();

    if(!sourceData || !targetData) {
      return;
    }

    const insertValue = {
      list: [] as any[],
      table_name: '',
      time_attribute: '',
    }

    const nodeInputs = targetData.node_inputs;
    if(!Array.isArray(nodeInputs) || nodeInputs.length === 0) {
      return;
    }

    const newNodeInputs = nodeInputs.map((input) => {
      if(input.key === key) {
        return {
          ...input,
          ...insertValue,
        }
      }

      return input
    })

    targetData.setData({
      node_inputs: newNodeInputs
    }, {
      deep: true,
    })
  }
  

  linkRemoveImpl(args: Pick<EventArgs['edge:mouseenter'], 'edge'>) {
    const { edge } = args;
    edge.addTools([
      'source-arrowhead',
      'target-arrowhead',
      {
        name: 'button-remove',
        args: {
          distance: -30
        }
      }
    ])
  }

  linkRemoveEnterImpl(args: EventArgs['edge:mouseleave']) {
    const { edge } = args;
    if(edge) {
      edge.removeTools(['button-remove', 
    
      'source-arrowhead',
      'target-arrowhead',
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
    this.diagram!.on('edge:removed', this.cleanEdgePassThroughData)
    this.diagram!.on('edge:mouseenter', this.linkRemoveImpl)
    this.diagram!.on('edge:mouseleave', this.linkRemoveEnterImpl)

  }

  uninstall() {
    this.diagram!.off('edge:removed', this.cleanEdgePassThroughData);
    this.diagram!.off('edge:mouseenter', this.linkRemoveImpl)
    this.diagram!.off('edge:mouseleave', this.linkRemoveEnterImpl)
  }
}