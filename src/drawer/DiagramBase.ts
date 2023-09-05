

// Diagram
import { DiagramController } from "./DiagramController";

import { FeatureManager } from "./FeatureManager";
import { LinkNodeHelper } from "./LinkNodeHelper";

import { Graph, Events, Basecoat, Shape, Node, Edge, Cell } from "@antv/x6";
import type { EventArgs, } from "@antv/x6";

import type { Options } from '@antv/x6/es/graph/options'

// export const EVENT_NAME = {
//   LOADED: 'loaded',
//   LAYOUT: 'layout',
//   DESTROY: 'destroy',
//   DIAGRAM_ZOOM: 'diagram-zoom',
//   DIAGRAM_MOUSEMOVE: 'diagram-mousemove',
//   DIAGRAM_UPDATED: 'diagram-updated',
//   NODE_CLICK: 'node-click',
//   NODE_REMOVE: 'node-removed',
//   NODE_DBCLICK: 'node-dbclick',
//   ANCHOR_DRAG_END: 'anchor-drag-end',
//   ANCHOR_MOUSE_ENTER: 'anchor-mouse-enter',
//   ANCHOR_MOUSE_LEAVE: 'anchor-mouse-leave',
//   NODE_MOUSE_ENTER: 'node-mouse-enter',
//   NODE_MOUSE_LEAVE: 'node-mouse-leave',
//   LINK_MOUSE_ENTER: 'link-mouse-enter',
//   LINK_MOUSE_LEAVE: 'link-mouse-leave',
//   NODE_DRAG_END: 'node-drag-start',
//   NODE_DRAG_START: 'node-drag-start',
//   CONTEXTMENU_SHOW: 'contextmenu-show',
//   LINK_HOVER: 'link-hover',
//   LINK_CLICK: 'link-click',
//   LINK_DB_CLICK: 'link-db-click',
//   LINK_DRAG_END: 'link-drag-end',
//   PATH_MENU_SHOW: 'pathmenu-show',
//   PATH_MENU_HIDE: 'pathmenu-hide',
//   PATH_MENU_CLICK: 'tvision-pathmenu-item-clicked',
// } as const;

export class DiagramBase extends Basecoat<Events<any>> {
  public diagram: Graph | null = null;

  public version = "v2";
  public target: HTMLDivElement | null;
  public controller: DiagramController | null;

  public linkNodeHelper: LinkNodeHelper;
  public featureManager: FeatureManager;

  private _container: HTMLDivElement | null = null;

  constructor() {
    super();

    this.controller = null;
    this.target = null;

    this.linkNodeHelper = new LinkNodeHelper(this);
    this.featureManager = new FeatureManager(this);
  }

  get zoomValue() {
    return this.diagram?.zoom();
  }

  public dispose() {
    super.dispose();
    this.diagram?.dispose();
    this.featureManager.dispose();
  }

  public init(target: string | HTMLDivElement, opts: Partial<Options.Manual>) {
    this.target = initTarget(target);

    this.initDiagram(opts);
    this.controller = new DiagramController(this);

    this.draw();

    this.featureManager!.execute();
  }

  public getInternalLinks() {
    // return this.diagram?._linkDataMap ?? [];
    return this.diagram?.getEdges() ?? [];
  }

  public getInternalNodes() {
    // return this.diagram?._nodeDataMap ?? [];
    return this.diagram?.getNodes() ?? [];
  }

  public getAllNodeMap() {
    // return turnObjectToMap(this.getInternalNodes());
  }

  /**
   * 获取指定节点
   * @param nodeId 节点ID
   * @returns
   */
  public getNode(nodeId: string) {
    return this.getAllNodeMap().get(nodeId) ?? {};
  }

  /**
   * 获取指定节点props
   * @param nodeId 节点ID
   * @returns
   */
  public getANodeProps(nodeId: string) {
    return this.getAllNodeMap().get(nodeId)?.props ?? null;
  }

  public cleanDiagram() {
    // this.diagram?.remove([]);
    const internalLinks = this.getInternalLinks();
    const internalNodes = this.getInternalNodes();

    Object.entries(internalLinks).forEach(([key, link]) => {
      this.removeNodeOrLinkIns(link as { id: string });
    });

    Object.entries(internalNodes).forEach(([key, node]) => {
      this.removeNodeOrLinkIns(node as { id: string });
    });
  }

  public removeNodeOrLinkIns(data: { id: string }) {
    if (!data?.id) {
      return;
    }
    this.removeNodeOrLink(data?.id);
  }

  public removeNodeOrLink(id: string) {
    if (!id) {
      return;
    }
    const cell = this.diagram?.getCellById(id)
    if(!cell) return;
    cell.remove();
  }

  public __unstable_clean_diagram__() {
    console.log(`请你确定这个方法有用吧哥哥`);
  }

  public initDiagram(opts: Record<string, any>) {
    if (this.target === null) {
      throw new Error(`target: 不能为 ${this.target}`);
    }
    this.diagram = new Graph(
      {
        container: this.target,
        ...opts
      }
    )
  }

  public initTarget(target: string | HTMLDivElement) {
    this.target = initTarget(target);
  }

  public draw() {
    // this.diagram?.draw();
  }

  public appendNodeOrLink = (node: Node | Edge) => {
    // this.diagram?.append(node);
    if (!node) return;
    if (node.isEdge()) {
      this.diagram?.addEdge(node);
    } else if (node.isNode()) {
      this.diagram?.addNode(node);
    }
  };
  /**
   * 获取所有线段
   */
  getLinks() {
    if (!this.diagram) return [];
    const links = this.diagram.getEdges();

    return links;
  }

  public updateNodeProps = (nodeId: string, props: Record<string, any>) => {
    if (!nodeId) {
      return;
    }
    const cell = this.diagram?.getCellById(nodeId)
    if(!cell) return;
    cell.setData(props, {
      deep: true,
      overwrite: false,
    })
  };

  public updateLinkProps(nodeId: string, props: Record<string, any>) {
    // this.diagram?.updateNodes({
    //   id: nodeId,
    //   props,
    // });
    const cell = this.diagram?.getCellById(nodeId)
    if(!cell) return;
    cell.setData(props, {
      deep: true,
      overwrite: false,
    })
  }

  public generatorUniqueId(num = 6) {
    return `id${new Date().valueOf()}_${generateMixed(num)}`;
  }

  public appendNewNode(opts: Record<string, any>): void {}
  public appendNewLink(opts: Record<string, any>): void {}

  getContainerRect = () => {
    return this.diagram?.container.getBoundingClientRect() ?? null;
  };
}

function initTarget(target: string | HTMLDivElement | unknown) {
  if (typeof target === "string") {
    const selectNode = document.querySelector(target);
    if (selectNode instanceof HTMLDivElement) {
      return selectNode;
    }
    return null;
  }

  if (target instanceof HTMLDivElement) {
    return target;
  }

  throw new Error(`you need to init target`);
}

function generateMixed(n) {
  const res = Math.random()
    .toString(n + 2)
    .substr(2, 10);
  return res;
}
