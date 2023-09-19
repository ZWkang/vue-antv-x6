// import { DiagramBase } from './DiagramBase';
// import { getIconColor } from './Features/shared/nodeIcon';
// import { IDisposable } from './IDisposable';
// import NodeGroupManager from './NodeGroupManager';
// import { NodeManager } from './Nodes';

import { Disposable } from "@antv/x6";
import { DiagramBase, type NodeType } from "../DiagramBase";
import { NodeGroupManager } from "../NodeGroupManager";
import { getIconColor } from "../Nodes/CustomNode.vue";
import { Node } from '@antv/x6'
import { createPorts } from "../Nodes/a";

/**
 * 管理业务中线段节点的生成规则的类
 */

export type LinkType = { fromNode: string, toNodeAnchor: string, toNode: string, fromNodeAnchor: string}

export type SaveNodeType = {
  className: string;
  conf_type: string
  height: number,
  iconColor: string;
  id: string;
  ins: LinkType[];
  label: string;
  name: string;
  node_conf: Record<string, unknown>;
  node_ext: Record<string, unknown>;
  node_group: string;
  node_input: unknown[];
  node_output: unknown[];
  node_type: string;
  node_type_id: number;
  numNode: number;
  outs: LinkType[];
  preview: boolean;
  tooltip: string;
  width: number;
  x: number;
  y: number;
}

export type DragNodeType = NodeType & {
    x: number;
    y: number;
    name: string;
    preview: boolean;
    tooltip: string
}



export class CanvasNodeLinkManager extends Disposable {
  // private nodeManager: NodeManager;
  private nodeGroupManager: NodeGroupManager;

  private container: DiagramBase;

  constructor(container: DiagramBase) {
    super();
    this.nodeGroupManager = new NodeGroupManager();

    this.container = container;
  }

  dispose() {
    this.nodeGroupManager.reset();
  }


  buildNode(node: DragNodeType | SaveNodeType) {
    const iconColor = getIconColor(node.conf_type);
    'resizable' in node && delete node?.resizable;

    const base = {
      width: 180,
      height: 32,
      x: node.x,
      y: node.y,
      iconColor,
      className: 'addclass',
      isCustom: false,
      showAnchors: true,
      shapeName: 'infoNode',
      shape: 'custom-vue-node',
    }

    if('numNode' in node) {
      const { x, y } = resolveXY((node as any)?.position, node?.x, node?.y);
      base.x = x;
      base.y = y;

      (base as any).data = {
        node_conf: node.node_conf,
        node_input: node.node_input,
        node_output: node.node_output,
        node_type: node.node_type,
        node_type_id: node.node_type_id,
        node_ext: node.node_ext,
        node_group: node.node_group,
      }

      const nodeData = this.generatorDomNode(node);

      (nodeData as any).ports = createPorts({
        node_input: node.node_input,
        node_output: node.node_output,
        node_type: node.node_type,
      }, nodeData.id);

      return {
        ...nodeData,
        ...base
      };
    }

    (base as any).data = {
      node_input: node.node_input,
      node_output: node.node_output,
      node_type: node.node_type,
      node_type_id: node.node_type_id,
      node_group: node.node_group,
    }

    // return this.generatorDomNode(node);

    const nodeData = this.generatorDomNode(node);

    (nodeData as any).ports = createPorts({
      node_input: node.node_input,
      node_output: node.node_output,
      node_type: node.node_type,
    }, nodeData.id);

    console.log(nodeData);
    return {
      ...nodeData,
      ...base
    };
  }

  /**
   * 插入节点实例
   * @param type
   * @param opts
   * @returns
   */
  // public insertInstance(type: 'commentNode' | 'link' | 'customNode', opts) {
  //   let node: unknown = null;
  //   if (type === 'customNode') {
  //     node = this.generatorDomNode(this.buildNodeOpts(opts));
  //   } else if (type === 'link') {
  //     node = this.generatorBezierLink(opts);
  //   } else if (type === 'commentNode') {
  //     node = this.generatorCommentNode(opts);
  //   }

  //   return node;
  // }

  public resetNodeGroupCounter() {
    this.nodeGroupManager.reset();
  }

  /**
   * 生成节点配置参数
   * @param node 节点配置
   * @returns
   */
  private buildNodeOpts(node: any): Node.Properties {
    const iconColor = getIconColor(node);
    const { x, y } = resolveXY(node?.position, node?.x, node?.y);
    delete node?.resizable;
    return {
      width: 180,
      height: 32,
      x,
      y,
      tooltip: node.description ?? '',
      iconColor,
      label: node.label ?? 'el-icon-pie-chart',
      className: 'addclass',
      id: this.container.generatorUniqueId(),
      isCustom: true,
      showAnchors: true,
      ...node,
      shapeName: 'infoNode',
    };
  }

  /**
   * 生成线段
   * @param opts
   * @returns
   */
  public generatorBezierLink(opts: LinkType) {
    return {
      source: { cell: opts.fromNode, port: opts.fromNodeAnchor },
      target: { cell: opts.toNode, port: opts.toNodeAnchor },
    }
  }

  /**
   * 生成正常节点
   * @param opts
   * @returns
   */
  private generatorDomNode(opts: Record<string, any>) {
    const id = this.container.generatorUniqueId();
    // 这里做个x/y值的改动
    const { x, y } = resolveXY(opts?.position, opts?.x, opts?.y);
    const defaultOptions = {
      id,
    };

    // 如果不存在opts.num的话
    // 这里需要走 node_group 自动生成组件的逻辑里
    if (!opts.numNode) {
      opts.numNode = this.nodeGroupManager.updateNodeId(opts?.node_group);
      opts.name = `${opts.name} -${opts.numNode}`;
    } else {
      // 已有的需要进行一次存储
      this.nodeGroupManager.setGroupId(opts?.node_group, opts?.numNode);
    }
    return {
      ...defaultOptions,
      ...opts,
      x,
      y,
    }
  }

  /**
   * 生成备注节点
   * @param options
   * @returns
   */
  private generatorCommentNode(options: Record<string, any>) {
    // const id = this.container.generatorUniqueId();

    // const defaultOptions = {
    //   x: 150,
    //   y: 120,
    //   id,
    //   className: 'infoGroup',
    //   // name: '内容',
    //   title: '备注',
    //   description: options?.title ?? '',
    // };

    // const mixinOpts: Record<string, unknown> = {
    //   ...defaultOptions,
    //   ...options,
    // };
    // const { x, y } = resolveXY(mixinOpts?.position, mixinOpts?.x, mixinOpts?.y);

    // return this.nodeManager.create('commentNode', {
    //   ...defaultOptions,
    //   ...options,
    //   x,
    //   y,
    // });
  }
}

/**
 * 处理 x,y 坐标的兼容性问题
 * @param options
 * @param x
 * @param y
 * @returns
 */
function resolveXY(options?: { x: number, y: number }, x: number, y: number) {
  if (options && (!x || !y)) {
    return {
      x: x ?? options?.x ?? Math.random() * 200,
      y: y ?? options?.y ?? Math.random() * 200,
    };
  }

  return {
    x,
    y,
  };
}

/**
 * 处理 anchor key 的处理，因为生成时按照一定规则合并了。
 * @param anchor
 * @returns
 */
function resolveAnchorKey(anchor: any) {
  if (typeof anchor === 'undefined')
    return {
      position: '',
      key: '',
    };

  const splitAnchor = anchor.split('-');

  return {
    position: splitAnchor[1],
    key: splitAnchor[0],
  };
}

/**
 * 处理 anchor key 的处理
 * @param key 
 * @param position 
 * @returns 
 */
function buildAnchorKey(key: string, position: string) {
  return `${key}-${position}`
}