import { LinkCommonProps } from "@tencent/tvision-t3/dist/esm/diagram/links";
import { ShapeCommonProps } from "@tencent/tvision-t3/dist/esm/diagram/nodes";
import { ElMessage } from "element-plus";
import { pick, template } from "lodash";

import { UpdateLinkItemProps } from "@/module/application/views/real-time/real-time-instance/utils/tvision-oop/businessCourse/EditDiagram";

import { DiagramBase } from "../../DiagramBase";
import { FlowCanvas } from "../../FlowCanvas";
import type { Edge } from "@antv/x6";


type LinkDataType = Pick<LinkCommonProps, 'fromNode' | 'toNode' | 'fromNodeAnchor' | 'toNodeAnchor'>

const NODE_INPUT_ITEM_NAME_PREFIX = '输入节点<%= index %>';
const NODE_INPUT_ITEM_KEY_PREFIX = 'INPUT_TABLE<%= index %>';
const NODE_INPUT_ITEM_TYPE = 'HIVE_TABLE';

export class DynamicNodeEvent {
  private container: FlowCanvas;
  constructor(container) {
    this.container = container
  }

  public isDynamicNode(nodeProps: ShapeCommonProps & { node_type: string }) {
    const { node_type } = nodeProps
    return node_type === 'one_sql'
  }
  appendDynamicNodeCopy(linkData: Edge) {
    const targetNode = linkData.getTargetNode();
    if(!targetNode) return;
    const targetData = targetNode.getData();

    const { node_input, id } = targetData;
    const len = node_input.length + 1;
    const firstNode = pick({ ...node_input[0] }, ['key', 'description', 'type']);

    
    const nodeInputKeyTemp = template(NODE_INPUT_ITEM_KEY_PREFIX)({ index: len });
    const nodeInputDescriptionTemp = template(NODE_INPUT_ITEM_NAME_PREFIX)({ index: len });

    const anchor = {
      ...firstNode,
      key: nodeInputKeyTemp,
      description: nodeInputDescriptionTemp,
    }


  }
  appendDynamicNode(linkData: LinkDataType) {
    if (!linkData) {
      return;
    }

    if (this.isAlreadyConnect(linkData)) {
      ElMessage.warning('数据流设计约束：一个输入点，只能对应一个输出');
      return;
    }

    const { toNode } = linkData;

    const toNodeProps = this.container.linkNodeHelper.getANodeProps(toNode);
    if (!toNodeProps) return;
    const { node_input, id } = toNodeProps;
    const len = node_input.length + 1;
    const firstNode = pick({ ...node_input[0] }, ['key', 'description', 'type']);

    const nodeInputKeyTemp = template(NODE_INPUT_ITEM_KEY_PREFIX)({ index: len });
    const nodeInputDescriptionTemp = template(NODE_INPUT_ITEM_NAME_PREFIX)({ index: len });
    // const temp = template(dynamic_anchor_value);

    // const key = temp({ index: len });
    const anchor = {
      ...firstNode,
      key: nodeInputKeyTemp,
      description: nodeInputDescriptionTemp,
    };
    const newLineData = {
      ...linkData,
      toNodeAnchor: `${anchor.key}-top`,
    };

    const newNodeInputs = [...node_input, anchor];
    const newNodes = {
      ...toNodeProps,
      node_input: newNodeInputs,
    };

    this.container.updateNodeProps(id, newNodes);
    this.dynamicAnchorsLink(newLineData)
  }
  
  dynamicAnchorsLink = (linkData) => {
    this.container.insertInstance('link', linkData);
    this.container.syncUpdateLineData(linkData);
  }

  
  public isAlreadyConnect = (linkData) => {
    const links = this.container.linkNodeHelper.getAllLinkData();
    const linkDataList = links.filter(Boolean);
    for (const currentLink of linkDataList) {
      if (!currentLink?.fromNodeId || !currentLink?.toNodeId) {
        break;
      }
      if (currentLink.fromNodeId === linkData.fromNode && currentLink.toNodeId === linkData.toNode) {
        return true;
      }
    }
    return false;
  }


  isSupportDynamicAnchors = (id: string) => {
    const node = this.container.linkNodeHelper.getANodeProps(id);
    if (node === null) {
      return false;
    }

    const { node_type } = node;
    if (node_type === 'one_sql' || node_type === 'one_sql_copy') {
      return true;
    }

    return false;
  }
}