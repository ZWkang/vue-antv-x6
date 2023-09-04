import { Bezier, Dom } from '@tencent/tvision-t3'
import { DiagramPropTypes } from '@tencent/tvision-t3/dist/esm/diagram/container';
import BaseLink, { LinkCommonProps } from '@tencent/tvision-t3/dist/esm/diagram/links/index'
import BaseNode, { ShapeCommonProps } from '@tencent/tvision-t3/dist/esm/diagram/nodes/index'
import { cloneDeep, pick } from 'lodash';

import { NodeContextMenuEvent } from '@/module/application/views/real-time/real-time-edit/model/events';

import { UpdateLinkItemProps } from '../../../real-time/real-time-instance/utils/tvision-oop/businessCourse/EditDiagram';
import { DiagramBase } from './DiagramBase'
import { DiagramController } from './DiagramController';
import NodeGroup from './NodeGroupManager';
import { NodeManager } from './Nodes';


const deleteNodeHtmlStr = `<i class="el-icon-close" style="color:#F56C6C;"></i> 删除节点`;

interface SingleFileNode {

}

export class OfflineCanvas extends DiagramBase {
  public nodeGroup: NodeGroup;
  private nodeManager: NodeManager;


  constructor(props) {
    super()

    this.nodeManager = new NodeManager()
    this.nodeGroup = new NodeGroup();
  }

  public initEvent() {

  }


  // 删除一条线段
  public deleteALink(id: string) {
    // const { props, id } = current;
    // this.diagram?.remove({
      // id
    // })
    // const cell = this.diagram?.getCellById(id)
    this.diagram?.removeCell(id);
  }

  public deleteANode(id: string) {
    // this.diagram?.remove(current)
    this.diagram?.removeCell(id);
  }


  init(target: string | HTMLDivElement, opts: DiagramPropTypes) {

    this.initDiagram({
      // target,
      pathMenu: [
        {
          title: "删除线",
          onClick: (event, current, diagram) => {
            this.trigger(NodeContextMenuEvent.DELETE_A_LINK_EVENT, event, current, diagram);
          }
        }
      ],
      contextMenu: [
        {
          title: ' <i class="el-icon-close" style="color:#F56C6C;"></i> 删除节点',
          isInfo: false,
          onClick: (event, current, diagram) => {
            this.trigger(NodeContextMenuEvent.DELETE_A_NODE_EVENT, event, current, diagram)
          }
        }
      ],
      linkConstructor: Bezier,
      ...opts
    })

    this.controller = new DiagramController(this)
    // this.draw();
    this.featureManager!.execute();
  }

  public appendNewNode(opts) {
    const nodeInstance = this.generatorDomNode(opts);
    this.appendNodeOrLink(nodeInstance);

    this.trigger(NodeContextMenuEvent.APPEND_NEW_NODE, nodeInstance);
  }

  public appendNewCommentNode(opts) {
    const nodeInstance = this.nodeManager.create('comment', opts);
    this.appendNodeOrLink(nodeInstance);
  }

  // 封装给业务初始化的
  // public restor(nodes, comments, links) {
  //   nodes.forEach(node => this.insertInstance('customNode', node));
  //   comments.forEach(comment => this.insertInstance('commentNode', comment));
  //   links.forEach(link => this.insertInstance('link', link));
  // }
  public restore(nodes, comments, links) {
    
  }


  public generatorDomNode(opts) {
    const id = this.generatorUniqueId();
    // 这里做个x/y值的改动
    const { x, y } = resolveXY(opts?.position, opts?.x, opts?.y)
    const defaultOptions = {
      // showAnchor: false,
      id
    }

    // 如果不存在opts.num的话
    // 这里需要走 node_group 自动生成组件的逻辑里
    if (!opts.num) {
      opts.num = this.nodeGroup.updateNodeId(opts?.node_group);
      opts.name = `${opts.name} -${opts.num}`;
    }

    return new Dom({
      ...defaultOptions,
      ...opts,
      x,
      y
    })
  }



  public generatorBezierLink(opts) {
    return this.nodeManager.create('link', opts);
  }

  public generatorCommentNode(options: Record<string, any>) {
    const id = this.generatorUniqueId();



    const defaultOptions = {
      x: 150,
      y: 120,
      id,
      className: 'infoGroup',
      name: '内容',
      showAnchors: false
    }

    const mixinOpts: Record<string, unknown> = {
      ...defaultOptions,
      ...options
    }
    const { x, y } = resolveXY(mixinOpts?.position, mixinOpts?.x, mixinOpts?.y)

    return this.nodeManager.create('customNode', {
      ...defaultOptions,
      ...options,
      x,
      y
    })
  }

  /**
   * 同步更新线段两侧数据
   * @param lineData 
   */
  public syncUpdateLineData(lineData: Pick<UpdateLinkItemProps, 'toNode' | 'toNodeAnchor'>) {
    const { toNode, toNodeAnchor } = lineData;
    const allNodes = this.linkNodeHelper.getAllNodesData();
    const lineToNode = allNodes.find((node) => node.id === toNode);
    const toNodeInput = cloneDeep(lineToNode?.props?.node_input);


    const toNodeType = String(toNodeAnchor ?? '').split('-')[0];


    // const insertValue: {
    //   list: any[];
    //   table_name: string;
    //   resource: string;
    //   time_attribute: string;
    // } = {
    //   list: [],
    //   table_name: '',
    //   resource: '',
    //   time_attribute: '',
    // };


    const newNodeInputs = toNodeInput.map((item) => {
      if (item.key === toNodeType) {
        const res = pick(item, ['key', 'descript', 'type']);
        return res;
      }
      return item;
    });

    const props = {
      node_input: newNodeInputs,
    };

    this.updateNodes([
      {
        id: toNode!,
        props,
      },
    ]);
  }

  public updateNodes(lineData) {

  }

  public dispose(): void {
    super.dispose();

    this.nodeGroup.dispose();
  }

  public getResult() {
    const allNodes = this.linkNodeHelper.getAllNodesData();
    const customNode = allNodes.filter(item => item.className !== 'infoGroup');
    const commentNode = allNodes.filter(item => item.className === 'infoGroup');

    return [customNode, commentNode]
  }

  private insertInstance(type: 'customNode' | 'link' | 'commentNode', opts) {
    let node: unknown = null;

    console.log(type, opts)
    if (type === 'customNode') {
      node = this.generatorDomNode(opts);
    } else if (type === 'link') {
      node = this.generatorBezierLink(opts);
    } else if (type === 'commentNode') {
      node = this.generatorCommentNode(opts);
    }

    if (node === null) {
      return;
    }

    this.appendNodeOrLink(node);
  }
}


function resolveXY(options, x, y) {
  if (options && (!x || !y)) {
    return {
      x: x ?? options?.x ?? Math.random() * 200,
      y: y ?? options?.y ?? Math.random() * 200
    }
  }

  return {
    x,
    y
  }
}