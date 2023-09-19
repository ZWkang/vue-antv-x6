// import { UpdateLinkItemProps } from '../../../real-time/real-time-instance/utils/tvision-oop/businessCourse/EditDiagram';
import { DiagramBase } from './DiagramBase';

function turnObjectToMap<T extends Record<string, any>>(obj: T): Map<string, any> {
  return new Map(Object.entries(obj));
}

/**
 * 计算缓存类
 * 类似 sort 的时候 一个值需要计算两次。
 */
class CalcCache {
  public cache: Map<string, number>;
  constructor() {
    this.cache = new Map();
  }
  /**
   * 计算两个节点路径长度
   * @param nodeId node id
   * @param x 节点 x
   * @param y 节点 y
   * @param _x 比较节点 x
   * @param _y 比较节点 y
   * @returns
   */
  calcPathLen(nodeId: string, x: number, y: number, _x: number, _y: number) {
    if (this.cache.get(nodeId)) {
      return this.cache.get(nodeId);
    }
    const result = (x - _x) ** 2 + (y - _y) ** 2;
    this.cache.set(nodeId, result);
    return result;
  }
  /**
   * 释放缓存内容
   */
  dispose() {
    this.cache.clear();
  }
}

function calcPathLen(x1, y1, x2, y2) {
  return Math.abs((x1 - x2)) ** 2 + Math.abs((y1 - y2)) ** 2
}



/**
 * 节点线段的辅助方法。
 */
export class LinkNodeHelper {
  constructor(public diagram: DiagramBase) { }

  public getAllDownstreamNodeUniqueById(nodeId) { }

  public getANodeInstance(nodeId) {
    const nodeMaps = this.getAllNodeMap();
    return nodeMaps.get(nodeId) ?? null;
  }

  public getANodeProps = (nodeId): Record<string, any> | null => {
    if (nodeId === null) {
      return null;
    }
    const nodeMaps = this.getAllNodeMap();
    console.log(nodeMaps);
    return nodeMaps.get(nodeId).props ?? null;
  };

  public getALinkInstance() { }

  public getUpstreamNode() { }

  public getAllUpStreamNode() { }

  public getDownStreamNode() { }

  public getAllDownStreamNode() { }

  public getDownStreamConnectLinks(nodeId: string): UpdateLinkItemProps[] {
    return this.diagram.getLinks().filter((item) => item.fromNode === nodeId) ?? [];
  }

  public getUpStreamConnectLinks() { }

  public getNodeDistance(aNodeId, bNodeId) { }

  public getAllNodeMap() {
    return turnObjectToMap(this.getInternalNodes());
  }

  public getAllNodeList(): any[] {
    const allNodes = this.getInternalNodes();
    const allNodesList = Object.entries(allNodes);
    return allNodesList.map(([key, val]) => val) ?? [];
  }

  public getAllNodeSortedByClosestByPosition(nodeId: string) {
    const allNodes = this.getAllNodeMap();
    const allNodeList = this.getAllNodeList();
    const currentNode = allNodes.get(nodeId);

    if (!currentNode) {
      return [];
    }
    const { x, y } = this.getNodePosition(nodeId);
    const sortedNodes = allNodeList
      .filter((node) => node.id !== nodeId)
      .sort((nodeA: any, nodeB: any) => {
        const nodeAPathLen = calcPathLen(nodeA.props.x, nodeA.props.y, x, y)
        const nodeBPathLen = calcPathLen(nodeB.props.x, nodeB.props.y, x, y)
        return nodeAPathLen - nodeBPathLen;
      });

    return sortedNodes;
  }

  public compareTwoNode = (nodeA, nodeB, x, y) => calcPathLen(
    nodeA?.x ?? nodeA?.props?.x ?? nodeA?.props?.position?.x,
    nodeA?.y ?? nodeA?.props?.y ?? nodeA?.props?.position?.y,
    x,
    y
  ) - calcPathLen(
    nodeB?.x ?? nodeB?.props?.x ?? nodeB?.props?.position?.x,
    nodeB?.y ?? nodeB?.props?.y ?? nodeB?.props?.position?.y,
    x,
    y
  )

  public getNodePosition(nodeId: string): { x: number; y: number } {
    const nodeProps = this.getANodeProps(nodeId);

    return {
      x: nodeProps?.x ?? 0,
      y: nodeProps?.y ?? 0,
    };
  }

  public findUpstreamConnectAnchorKey = (nodeId: string, anchorKey: string) => {
    const anchorId = `${anchorKey}-top`;
    return this.findConnectAnchorNode(nodeId, anchorId);
  };

  public findConnectAnchorNode = (nodeId: string, anchorId: string) => {
    const links = this.getAllLinkData();
    const currentLink = links.find((item) => item?.toNode === nodeId && item?.toNodeAnchor === anchorId);
    // return currentLink ?? null;
    const { fromNode } = currentLink;
    if (!fromNode) return null;

    return this.getANodeProps(fromNode);
  };

  public getNodePropsById(nodeId) { }

  public getUniqueAllUpStreamNodes(nodeId) { }

  public getUniqueAllDownStreamNodes(nodeId) { }

  public getAllLinkData(): any[] {
    const linkDataMap = this.getInternalLinks();
    const result: any[] = [];
    Object.entries(linkDataMap).forEach(([key, val]) => {
      result.push(val.props);
    });

    return result;
  }

  public getALlLinkList(): any[] {
    const linkDataMap = this.getInternalLinks();
    const result: any[] = [];
    Object.entries(linkDataMap).forEach(([key, val]) => {
      result.push(val);
    });

    return result;
  }

  /**
   * 获得所有节点的props信息
   * @returns 
   */
  public getAllNodesData(): any[] {
    const allNodeInstances = this.getAllNodeList();
    return allNodeInstances.map((item) => item?.props ?? null).filter(Boolean);
  }

  /**
   * 获得原生的节点信息
   * @returns 
   */
  public getInternalNodes(): Record<string, any> {
    return this.diagram.diagram?._nodeDataMap ?? {};
  }

  /**
   * 获得原生的线段节点信息
   * @returns 
   */
  public getInternalLinks(): Record<string, any> {
    return this.diagram.diagram?._linkDataMap ?? {};
  }

  /**
   * 判断一条线段是否已经存在过连接
   * @param linkData 
   * @returns 
   */
  public detectLinkExist(linkData): boolean {
    const allLinks = this.getALlLinkList();
    for (const currentLink of allLinks) {
      if (!currentLink?.fromNodeId || !currentLink?.toNodeId) {
        break;
      }
      if (currentLink.fromNodeId === linkData.fromNode && currentLink.toNodeId === linkData.toNode) {
        return true;
      }
    }
    return false;
  }
}
