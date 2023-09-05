import { FeatureBase } from "./FeatureBase";
import type { EventArgs, Graph, Node, Edge } from "@antv/x6";
import { MiniMap } from "@antv/x6-plugin-minimap";
import { isCommentNode } from "../helper";

// 鼠标 hover 上去有个删除标记
export class DragAutoLinkFeature extends FeatureBase {
  static featureName = "DragAutoLinkFeature";
  static order = "pre" as const;


  get allNodes() {
    return this.container.diagram?.getNodes();
  }

  getNodeSize(node: Node<Node.Properties>) {
    return node.size();
  }

  getNodePosition(node: Node<Node.Properties>) {
    return node.position();
  }

  getPrepareConnectNode(node: Node) {
    const allNodes = this.canConnectionNodes(node);

    const data = node.getData();
    const { node_input, node_output} = data;
    if(!allNodes || allNodes.length === 0) return null;

    const filterNodes = allNodes.filter(_node => this.getARestPortNode(_node));
    if(filterNodes.length === 0) return null;

    if(node_input.length === 0) return null;

    return filterNodes[0];
  }

  getPrepareConnectPort(node: Node) {
    const prepareConnectNode = this.getPrepareConnectNode(node);
    return prepareConnectNode?.ports.items[0].id;
  }

  public handleNodeAdded(args: EventArgs["node:added"]) {
    const { node } = args;
    if (!node.isNode() || isCommentNode(node)) return null;
    const allNodes = this.canConnectionNodes(node);

    const data = node.getData();
    const { node_input, node_output} = data;
    if(!allNodes || allNodes.length === 0) return null;

    const filterNodes = allNodes.filter(_node => this.getARestPortNode(_node));
    if(filterNodes.length === 0) return null;

    if(node_input.length === 0) return null;

    const firstNode = filterNodes[0];

    const edgeData = {
      source: firstNode.id,
      target: node.id,
      sourcePort: firstNode.ports.items[0].id,
      targetPort: node.ports.items[0].id,
    }
    
    this.diagram?.addEdge(edgeData);

    // 同步上下游内容
    this.syncLinkData(edgeData);
    return null;
  }

  public syncLinkData(edge: Edge.Metadata) {
    const { source, target, sourcePort, targetPort } = edge;
    if(!source || !target || !sourcePort || !targetPort) return null;
    const sourceNode = this.diagram?.getCellById(String(source));
    const targetNode = this.diagram?.getCellById(String(target));
    const sourceData = sourceNode?.getData();
    const targetData = targetNode?.getData();

    // 根据 port 匹配上
    const key = sourcePort.split('-')[0]
    const targetKey = targetPort.split('-')[0]
    const sourcePortData = sourceData?.node_output.find((item: any) => item.key === key);

    if(!sourcePortData) return;

    const { list = [], table_name = '', time_attribute = '' } = sourcePortData;

    targetData.node_input.map((item: any) => {
      if(item.key === targetKey) {
        return {
          ...item,
          list,
          table_name,
          time_attribute
        }
      }
      return item;
    })
    
    targetNode?.setData(targetData, {
      deep: true
    });
  }

  public getARestPortNode(node: Node) {
    const data = node.getData();
    const { node_output } = data;
    const connects = this.container.diagram?.getConnectedEdges(node);
    return connects?.length === node_output?.length;
  }

  public canConnectionNodes(node: Node) {
    const { x, y } = this.getNodePosition(node);
    const { width, height } = this.getNodeSize(node);

    return this.allNodes
      ?.filter((_node) => _node.id !== node.id && !isCommentNode(_node))
      .filter((_node) =>
        inTheAcceptArea(
          x,
          y,
          this.getNodePosition(_node)!.x,
          this.getNodePosition(_node)!.y
        )
      );
  }

  public shouldConnectAnchor(node1, node2) {
    // 1. 获取可连接范围内元素
    // 1. 检查两个节点是否都有对应anchor
    // 2. 检查两者可相连的内容是否一致
    //
  }

  install() {
    this.diagram?.on('node:added', this.handleNodeAdded)
  }

  uninstall() {
    this.diagram?.off('node:added', this.handleNodeAdded)
  }
}

/**
 * 判断一个点是否在另一个节点的可接入区域内
 * 以一个点为基点的矩阵区域
 * 宽570 高180
 * @param {*} x1 区域的基本点 x点
 * @param {*} y1 区域的基本点 y点
 * @param {*} x2 对比的基本点 x点
 * @param {*} y2 对比的基本点 y点
 * @param {
 *  areaWidth 区域的宽度
 *  areaHeight 区域的高度
 *  nodeHeight 节点的高度
 *  nodeWidth 节点的宽度
 * } limit
 * @returns
 */
function inTheAcceptArea(
  x1,
  y1,
  x2,
  y2,
  limit = { areaWidth: 200, areaHeight: 150, nodeHeight: 30, nodeWidth: 180 }
) {
  const leftWidth = (limit.areaWidth - limit.nodeWidth) / 2;
  const topLeft = [x1 - leftWidth, y1 - limit.areaHeight];
  const topRight = [x1 + leftWidth + limit.nodeWidth, y1 - limit.areaHeight];
  const bottomLeft = [x1 - leftWidth, y1 + limit.nodeHeight];
  const bottomRight = [x1 + leftWidth + limit.nodeWidth, y1 + limit.nodeHeight];

  const nodeTopLeft = [x2, y2];
  const nodeTopRight = [x2 + limit.nodeWidth, y2];
  const nodeBottomLeft = [x2, y2 + limit.nodeHeight];
  const nodeBottomRight = [x2 + limit.nodeWidth, y2 + limit.nodeHeight];

  console.log("values", leftWidth, topLeft, topRight, bottomLeft, bottomRight);

  return (
    doesAPointInTheArea(nodeTopLeft, [
      topLeft,
      topRight,
      bottomLeft,
      bottomRight,
    ]) ||
    doesAPointInTheArea(nodeTopRight, [
      topLeft,
      topRight,
      bottomLeft,
      bottomRight,
    ]) ||
    doesAPointInTheArea(nodeBottomLeft, [
      topLeft,
      topRight,
      bottomLeft,
      bottomRight,
    ]) ||
    doesAPointInTheArea(nodeBottomRight, [
      topLeft,
      topRight,
      bottomLeft,
      bottomRight,
    ])
  );
}

/**
 * 判断一个节点是否在一个区域内
 * @param {*} point 一个像素点
 * @param {*} area 一个区域的四方点
 * @returns
 */
function doesAPointInTheArea(point = [0, 0], area: any[] | null = null) {
  if (area === null) {
    return false;
  }

  const [x, y] = point;
  const [topLeft, topRight, bottomLeft, bottomRight] = area;
  if (
    x > topLeft[0] &&
    x < topRight[0] &&
    y < bottomLeft[1] &&
    y > topRight[1]
  ) {
    return true;
  }

  return false;
}
