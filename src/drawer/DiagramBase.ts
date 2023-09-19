// Diagram
import { DiagramController } from "./DiagramController";

import { FeatureManager } from "./FeatureManager";
import { DeleteALinkFeature } from "./Features/deleteALinkFeature";
import { DeleteANodeFeature } from "./Features/deleteANodeFeature";
import { LinkNodeHelper } from "./LinkNodeHelper";
import { register, getTeleport } from "@antv/x6-vue-shape";

import { Graph, Events, Basecoat, Shape, Node, Edge, Cell } from "@antv/x6";
import type { EventArgs } from "@antv/x6";

import type { Options } from "@antv/x6/lib/graph/options";
import CustomNode from "./Nodes/CustomNode.vue";
import { CanvasNodeLinkManager } from "./Features/NodeLinkManager";
import { RuleFeature } from "./Features/ruleFeature";

register({
  shape: "custom-vue-node",
  width: 180,
  height: 32,
  component: CustomNode,
});

export type NodeType = {
  // "only_out"
  conf_type: string;
  description: string;
  label: 'light-icon-component-output-tdw',
  node_group: "读取",
  node_input: { key: string, description: string, type: string }[],
  node_output: { key: string, description: string, type: string }[],
  // 'input_tdw'
  node_type: string;
  // 1217
  node_type_id: number;
}



export class DiagramBase extends Basecoat<Events<any>> {
  public diagram: Graph | null = null;

  public version = "v2";
  public target: HTMLDivElement | null;
  public controller: DiagramController | null;

  public linkNodeHelper: LinkNodeHelper;
  public featureManager: FeatureManager;
  public nodeLinkManager: CanvasNodeLinkManager;

  private _container: HTMLDivElement | null = null;

  constructor() {
    super();
    this.target = null;
    this.linkNodeHelper = new LinkNodeHelper(this);
    this.featureManager = new FeatureManager(this);
    this.controller = new DiagramController(this);
    this.nodeLinkManager = new CanvasNodeLinkManager(this);
  }

  get zoomValue() {
    return this.diagram?.zoom();
  }

  public init(target: string | HTMLDivElement, opts: Partial<Options.Manual>) {
    this.target = initTarget(target);

    this.initDiagram(opts);
    this.draw();
    this.initFeatures();
  }

  public initFeatures() {
    this.featureManager
      .appendFeature(DeleteALinkFeature)
      .appendFeature(DeleteANodeFeature)
      .appendFeature(RuleFeature)

    this.featureManager.execute();
  }

  public getInternalLinks() {
    return this.diagram?.getEdges() ?? [];
  }

  public getInternalNodes() {
    return this.diagram?.getNodes() ?? [];
  }

  public getAllNodeMap() {}

  /**
   * 获取指定节点
   * @param nodeId 节点ID
   * @returns
   */
  public getNode(nodeId: string) {
    // return this.getAllNodeMap().get(nodeId) ?? {};
    return this.diagram?.getCellById(nodeId) ?? null;
  }

  /**
   * 获取指定节点props
   * @param nodeId 节点ID
   * @returns
   */
  public getANodeProps(nodeId: string) {
    return this.diagram?.getCellById(nodeId).getData() ?? null;
  }

  public cleanDiagram() {
    this.diagram?.clearCells();
  }

  public dispose() {
    super.dispose();
    this.diagram?.clearCells({
      silent: true,
    });
    this.featureManager.dispose();
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
    const cell = this.diagram?.getCellById(id);
    if (!cell) return;
    cell.remove();
  }

  public __unstable_clean_diagram__() {
    console.log(`请你确定这个方法有用吧哥哥`);
  }

  public initDiagram(opts: Partial<Options.Manual>) {
    if (this.target === null) {
      throw new Error(`target: 不能为 ${this.target}`);
    }

    this.diagram = new Graph({
      container: this.target!,
      ...opts,
    });
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
    const cell = this.diagram?.getCellById(nodeId);
    if (!cell) return;
    cell.setData(props, {
      deep: true,
      overwrite: false,
    });
  };

  public appendNewNode(node: NodeType) {
    // this.diagram?.addNode({
    //   shape: 'custom-vue-node',
    //   x: 100,
    //   y: 200,
    //   width: 180,
    //   height: 32,
    //   data: node,
    //   label: node.label,
    // })
    const data = this.nodeLinkManager.buildNode(node);
    this.diagram?.addNode(data);
  }

  public updateLinkProps(nodeId: string, props: Record<string, any>) {
    const cell = this.diagram?.getCellById(nodeId);
    if (!cell) return;
    cell.setData(props, {
      deep: true,
      overwrite: false,
    });
  }

  public generatorUniqueId(num = 6) {
    return `id${new Date().valueOf()}_${generateMixed(num)}`;
  }

  // public appendNewNode(opts: Record<string, any>): void {}
  // public appendNewLink(opts: Record<string, any>): void {}

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

function generateMixed(n: number) {
  const res = Math.random()
    .toString(n + 2)
    .substr(2, 10);
  return res;
}
