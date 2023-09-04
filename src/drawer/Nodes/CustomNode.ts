// import '../styles/businessDiagramNode.scss';

import { ShapeCommonProps } from '@tencent/tvision-t3/dist/esm/diagram/nodes/index';
import { BaseShapeMethod } from 'application/static/tvisionT3/index.js';
import { create, Selection } from 'd3-selection';
import { get } from 'lodash';

import { exampleNodeStatus } from '@/module/application/views/offline/sql-task-instance/model/conf';
// import { ProcessNodeType } from '@/module/application/views/app/business-course/model';
import { delay } from '@/module/application/views/real-time/real-time-instance/utils/tvision-oop/CustomNodes/utils';

import { getIconColor } from '../Features/shared/nodeIcon';

enum ModelInputAnchorColor {
  'MODEL' = '#E6A23C',
  'default' = '#366DF4',
}

enum ModelOutputAnchorColor {
  'MODEL' = '#E6A23C',
  'default' = '#06dd35',
}

function buildTitle(data: { key: string; type: string; description: string }) {
  const { key, type, description } = data;

  return `${key}:${type}-${description}`;
}

export interface CustomNodeProps extends ShapeCommonProps, Recordable {
  /** 是否为激活状态节点 */
  active?: any;
  title?: string;
  subTitle?: string;
  iconSrc?: string;
  showAnchors?: boolean;
  tiplog?: boolean;
  node_input?: { key: string; type: string; description: string }[];
  node_output?: { key: string; type: string; description: string }[];
}

export interface BusinessCourseNodeTaskItem extends CustomNodeProps {
  id: number;
  name: string;
  idPath: number[];
}

class CustomDomNode extends BaseShapeMethod<CustomNodeProps> {
  public initialWidth = 180;
  public initialHeight = 32;
  private domElement: Selection<HTMLDivElement, undefined, null, undefined>;
  private domBody: Selection<HTMLDivElement, undefined, null, undefined>;
  private domTitle: Selection<HTMLSpanElement, undefined, null, undefined>;
  // private domSubTitle: Selection<HTMLSpanElement, undefined, null, undefined>;
  private domInfo: Selection<HTMLDivElement, undefined, null, undefined>;
  private nodeIcon: Selection<HTMLSpanElement, undefined, null, undefined>;
  private nodeIconBox: Selection<HTMLDivElement, undefined, null, undefined>;
  private domPreview: Selection<HTMLDivElement, undefined, null, undefined>;
  private domTask: Selection<HTMLSpanElement, undefined, null, undefined>;
  private domFlagText: Selection<HTMLSpanElement, undefined, null, undefined>;
  private nodeStatus: Selection<HTMLDivElement, undefined, null, undefined>;
  private diagramWrapperDomSelector: string;

  public constructor(props: CustomNodeProps) {
    super(
      {
        ...props,
        resizable: false,
      },
      {
        initialWidth: 180,
        initialHeight: 32,
        minHeight: 15,
        minWidth: 15,
        initialRadius: 30,
        type: 'tvision-node',
        shapeName: 'dom',
        isDom: true,
        custom: true,
        tiplog: false,
      },
    );
    this.domElement = create('div');
    this.domBody = create('div');
    this.nodeIconBox = create('div');
    this.nodeIcon = create('span');
    this.domInfo = create('div');
    this.domTitle = create('span');
    // this.domSubTitle = create('span');
    this.nodeStatus = create('div');
    this.domPreview = create('div');
    this.domTask = create('span');
    this.domFlagText = create('span');
    this.diagramWrapperDomSelector = '#diagram';
  }

  public render() {
    if (this.shape) {
      this.reRender(this.props);
      this.setImmediateNodeActiveNode(this as unknown as InstanceType<typeof BaseShapeMethod<CustomNodeProps>>);
      return this.shape;
    }
    const {
      // id,
      // title = '',
      // node_type: nodeType = '',
      // label,
      flagText,
      showNodeStatus = true,
    } = this.props;
    // 1、左侧图标：nodeIconBox
    this.nodeIconBox.append(() => this.nodeIcon.node());
    this.domElement.append(() => this.nodeIconBox.node());
    // 2、中间内容：domBody
    this.domElement.append(() => this.domBody.node());
    if (flagText) {
      this.domElement.append(() => this.domFlagText.node());
    }

    this.reRender(this.props);
    this.setImmediateNodeActiveNode(this as unknown as InstanceType<typeof BaseShapeMethod<CustomNodeProps>>);
    return this.domElement;
  }

  public style() {
    return ` 
      & .custom_node_active{
        animation: animated-border 0.5s linear infinite;
      }
    `;
  }

  /**
   * 设置激活状态节点
   * @param node 节点实例
   */
  public setActiveNode(node: BaseShapeMethod<CustomNodeProps>) {
    if (node.props.active) {
      const nodeDom = get(node, 'domElement._groups[0][0]');
      if (!nodeDom) return;
      const classNameList = Array.from(get(nodeDom, 'classList') ?? []);
      const hasActiveClassName = classNameList.includes('custom_node_active');
      if (!hasActiveClassName) nodeDom.classList.add?.('custom_node_active');
    }
  }

  /**
   * 清空节点激活状态
   * @param node 节点实例
   */
  public clearActiveNode(node: BaseShapeMethod<CustomNodeProps>) {
    if (node.props.active) {
      const nodeDom = get(node, 'domElement._groups[0][0]');
      if (!nodeDom) return;
      const classNameList = Array.from(get(nodeDom, 'classList') ?? []);
      const hasActiveClassName = classNameList.includes('custom_node_active');
      if (hasActiveClassName) nodeDom.classList.remove?.('custom_node_active');
    }
  }

  /**
   * 即时的节点高亮功能
   * @param nodeInstance 节点实例
   * @param timeout 高亮时间
   */
  public setImmediateNodeActiveNode(
    nodeInstance: InstanceType<typeof BaseShapeMethod<CustomNodeProps>>,
    timeout: number = 3 * 1500,
  ) {
    this.setActiveNode(nodeInstance);
    (async () => {
      await delay(timeout);
      this.clearActiveNode(nodeInstance);
    })();
  }

  /**
   * 清空所有节点激活状态
   * @param node
   * @param classNameList
   */
  public clearAllActiveNode(node) {
    if (node.props?.active) {
      const diagramWrapper = document.querySelector(this.diagramWrapperDomSelector);
      if (diagramWrapper) {
        const elements = diagramWrapper.getElementsByClassName('business-node');
        for (const element of elements) {
          element?.classList?.remove?.('custom_node_active');
        }
      }
    }
  }

  public reRender(configs: CustomNodeProps) {
    const {
      // id,
      width = this.initialWidth,
      height = this.initialHeight,
      // title = '',
      // subTitle = '',
      // iconSrc = '',
      tiplog = false, // 节点是否激活状态
      // iconColor = '#4D6EF2', // 节点图标颜色
      node_type: nodeType = '',
      flagText = '',
      flagTextStyle = {},
      skipColor,
      skipMessage,
      skip,
      label,
      name,
      preview,
      showNodeStatus = true,
      task_index: taskIndex,
      skip_flag: skipFlag = false,
    } = configs;
    // 节点图标颜色
    const iconColor = getIconColor(configs);
    let statusInfo;
    if (configs.node_state === 'CACHE') {
      statusInfo = { icon: [exampleNodeStatus.SUCC?.icon, 'SUCC'].filter(Boolean).join(' '), info: '已完成(缓存)' }
    } else if (configs.node_state === 'SKIP') {
      statusInfo = {}
    } else {
      statusInfo = {
        ...exampleNodeStatus[configs.node_state],
        icon: [exampleNodeStatus[configs.node_state]?.icon, configs.node_state].filter(Boolean).join(' '),
      }
    };
    // 1、左侧节点图标
    this.nodeIcon.classed(label, true);
    const nodeIconBoxClassNameString = ['tvision-node-dom-icon'].join(' ');
    this.nodeIconBox.attr('class', nodeIconBoxClassNameString);
    this.nodeIconBox.attr('class', nodeIconBoxClassNameString).attr('id', ''.concat(String(this.id), '-icon'));

    // 2、中间节点名称
    this.domBody.attr('id', ''.concat(String(this.id), '-body'));
    this.domBody.classed('tvision-node-dom-content', true);
    this.domBody.style('position', 'relative');
    const domElementClassNameString = ['tvision-node-dom', 'tvision-node-dom-unit'].join(' ');
    this.domElement.attr('class', domElementClassNameString);
    this.domElement.attr('id', ''.concat(String(this.id), '-title'));
    // 3、右边节点状态信息
    if (showNodeStatus && configs.node_state !== 'SKIP') {
      this.domElement.append(() => this.nodeStatus.node());
      const nodeStatusClassString = ['tvision-node-dom-status', statusInfo.icon, 'status-icon']
        .filter(Boolean)
        .join(' ');
      this.nodeStatus.attr('class', nodeStatusClassString);
      this.domTask.classed('tvision-node-dom-task_index', true);
      if (taskIndex !== undefined) {
        this.domElement.append(() => this.domTask.node());
        this.domTask.html(taskIndex);
      }
    } else {
      this.nodeStatus.remove();
    }
    // 4、禁用状态
    if (skipFlag) {
      this.domElement.style('background-color', skipColor || '#dfdfdf');
    } else {
      this.domElement.style('background-color', '#fff');
      this.nodeIcon.style('background-color', iconColor);
    }

    if (flagText) {
      this.domFlagText.classed('tvision-node-dom-task_index', true);
      this.domFlagText.style('position', 'absolute');
      this.domFlagText.style('right', '-60px');
      this.domFlagText.style('color', `#f66620`);
      this.domFlagText.style('border-radius', '4px');

      Object.keys(flagTextStyle).forEach((key) => {
        this.domFlagText.style(key, flagTextStyle[key]);
      });

      this.domElement.attr('title', skipMessage);
      this.domFlagText.html(flagText);
    }

    if (preview) {
      this.domElement.append(() => this.domPreview.node());
      this.domPreview.attr('title', '被选中的节点将不会被合并执行');
    }
    this.domPreview.classed('tvision-preview', preview);

    this.domElement.classed('custom_node_active', tiplog);
    this.domBody.html(name);
    this.domElement.style('width', ''.concat(String(width), 'px')).style('height', ''.concat(String(height), 'px'));

    // if (subTitle) {
    //   this.domSubTitle.text(subTitle).attr('class', 'subtitle').attr('title', subTitle);
    // }
  }

  /**
   * 获取锚点列表
   * @returns
   */
  public getAnchors() {
    const { width, height } = this.getConfigs();

    const { node_input: nodeInput = [], node_output: nodeOutput = [], node_type: nodeType } = this.props;
    const result: any[] = [];

    // 针对sql节点，只有一个输入阵脚
    if (['one_sql', 'one_sql_copy'].includes(nodeType)) {
      const inputAnchors =
        nodeInput?.map((firstNodeInputItem) => ({
          x: width / 2,
          y: -2,
          color: ModelInputAnchorColor[firstNodeInputItem.type] ?? ModelInputAnchorColor.default,
          type: firstNodeInputItem.type,
          title: `${firstNodeInputItem.key}:${firstNodeInputItem.type}-${firstNodeInputItem.description}`,
          id: `${this.id}:${firstNodeInputItem.key}-top`,
          placement: 'top',
        })) ?? [];
      const outputAnchors =
        nodeOutput?.map((firstNodeOutputItem) => ({
          x: width / 2,
          y: height - 2,
          color: ModelOutputAnchorColor[firstNodeOutputItem.type] ?? ModelOutputAnchorColor.default,
          type: firstNodeOutputItem.type,
          title: `${firstNodeOutputItem.key}:${firstNodeOutputItem.type}-${firstNodeOutputItem.description}`,
          id: `${this.id}:${firstNodeOutputItem.key}-bottom`,
          placement: 'bottom',
        })) ?? [];
      // return inputAnchors.concat(outputAnchors);
      const anchors = inputAnchors.concat(outputAnchors);
      return anchors;
    }

    let topNum = 1;
    let botNum = 1;
    if (nodeInput) {
      nodeInput.forEach((item) => {
        result.push({
          x: (width / (nodeInput.length + 1)) * topNum,
          y: -2,
          color: ModelInputAnchorColor.default,
          type: item.type,
          title: `${item.key}:${item.type}-${item.description}`,
          id: `${this.id}:${item.key}-top`,
          placement: 'top',
        });
        topNum += 1;
      });
    } else {
      result.push(
        {
          x: -3,
          y: height / 2 - 5,
          // type: item.type,
          color: ModelInputAnchorColor.default,
          id: ''.concat(String(this.id), ':left'),
          placement: 'left',
        },
        {
          x: width - 2,
          y: height / 2 - 5,
          // type: item.type,
          color: ModelInputAnchorColor.default,
          id: ''.concat(String(this.id), ':right'),
          placement: 'right',
        },
      );
    }

    if (nodeOutput) {
      nodeOutput.forEach((item) => {
        result.push({
          x: (width / (nodeOutput.length + 1)) * botNum,
          y: height - 2,
          color: ModelOutputAnchorColor[item.type] ?? ModelOutputAnchorColor.default,
          type: item.type,
          title: `${item.key}:${item.type}-${item.description}`,
          id: `${this.id}:${item.key}-bottom`,
          placement: 'bottom',
        });
        botNum += 1;
      });
    } else {
      result.push(
        {
          x: width / 2 - 5,
          y: -2,
          // type: item.type,
          color: '#06dd35',
          id: ''.concat(String(this.id), ':top'),
          placement: 'top',
        },
        {
          x: width / 2 - 5,
          y: height - 2,
          color: '#06dd35',
          // type: item.type,
          id: ''.concat(String(this.id), ':bottom'),
          placement: 'bottom',
        },
      );
    }
    return result;
  }
}

export default CustomDomNode;
