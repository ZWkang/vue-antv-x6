import type { Cell } from "@antv/x6";
import {} from "@antv/x6";

type IDataBase = {
  id: string;
  node_type: string;
  // debug模式中 或者 实例模式中存在
  // flagText: string;

  width: number;
  height: number;
  label: string;
  name: string;
};

function html(cell: Cell) {
  const data = cell.getData();
  const attrs = cell.getAttrs();

  // 如果节点存在 执行更新逻辑。
  const body = document.createElement("div");
  body.setAttribute("id", data.id);

  const iconContainer = document.createElement("div");
  iconContainer.setAttribute("id", `${data.id}-icon-container`);
  const icon = document.createElement("span");
  icon.setAttribute("id", `${data.id}-icon`);

  const flagText = document.createElement("span");
  flagText.setAttribute("id", `${data.id}-flag-text`);

  const title = document.createElement("div");
  title.setAttribute("id", `${data.id}-title`);

  iconContainer.appendChild(icon);
  body.appendChild(iconContainer);
  body.appendChild(title);

  if (data.flagText) {
    body.appendChild(flagText);
  }

  rerender(data);

  return body;
  function rerender(data: any) {
    const icon = document.querySelector(`#${data.id}-icon`)!;
    const iconContainer = document.querySelector(`#${data.id}-icon-container`)!;
    const title = document.querySelector(`#${data.id}-title`)!;
    const flagTextNode = document.querySelector(`#${data.id}-flag-text`)!;
    const body = document.querySelector(`#${data.id}`)!;

    // body.style.position = "relative";

    const {
      width,
      height,
      // title = '',
      // subTitle = '',
      // iconSrc = '',
      tiplog = false, // 节点是否激活状态
      // iconColor = '#4D6EF2', // 节点图标颜色
      node_type = "",
      flagText = "",
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
      conf_type,

      node_state,
    } = data;

    icon.className = `${label}`;
    const iconColor = getIconColor(conf_type);
    const statusInfo = getStatusInfo(node_state);

    if (showNodeStatus && node_state !== "SKIP") {
      const nodeStatusNode = document.createElement("div");
      nodeStatusNode.setAttribute("id", `${data.id}-node-status`);
      nodeStatusNode.setAttribute("class", `${statusInfo?.icon} status-icon`);
      body.appendChild(nodeStatusNode);
    } else {
      const nodeStatusNode = document.querySelector(`#${data.id}-node-status`);
      if (nodeStatusNode) {
        body.removeChild(nodeStatusNode);
      }
    }

    if (typeof taskIndex !== "undefined") {
      const taskIndexNode = document.createElement("div");
      taskIndexNode.setAttribute("id", `${data.id}-task-index`);
      taskIndexNode.setAttribute("class", `task-index`);
      taskIndexNode.innerHTML = taskIndex;
      body.appendChild(taskIndexNode);
    } else {
      const taskIndexNode = document.querySelector(`#${data.id}-task-index`);
      if (taskIndexNode) {
        body.removeChild(taskIndexNode);
      }
    }

    if (skipFlag) {
      // body.className = body.className + ' '
      body.style.backgroundColor = skipColor || "#dfdfdf";
    } else {
      body.style.backgroundColor = "#fff";
      icon.style.backgroundColor = iconColor;
    }
    if (flagText) {
      // const flagTextNode = document.createElement('div');
      flagTextNode.setAttribute("class", "tvision-node-dom-task_index");
      flagTextNode.style.position = "absolute";
      // flagTextNode.style.top = '0';
      flagTextNode.style.right = "-60px";
      flagTextNode.style.borderRadius = "4px";

      Object.keys(flagTextStyle).forEach((key) => {
        flagTextNode.style[key] = flagTextStyle[key];
      });

      flagTextNode.setAttribute("title", skipMessage);
      flagTextNode.innerHTML = flagText;
    }

    if (preview) {
    }
  }

  // 如果节点不存在， 执行初次渲染逻辑
}

export const enum NodeConfType {
  /** 输入组件 */
  outputNodeReg = "only_out",
  /** 写入组件 */
  inputNodeReg = "only_in",
  /** 中间组件 */
  bothNodeReg = "both",
}

export const NodeConfTypeIconColor = {
  [NodeConfType.inputNodeReg]: "#969ff6",
  [NodeConfType.bothNodeReg]: "#90A6BF",
  [NodeConfType.outputNodeReg]: "#84AEFF",
};
export function getIconColor(conf_type: string) {
  const iconColor =
    NodeConfTypeIconColor[conf_type as NodeConfType] ?? "#84AEFF";
  return iconColor;
}
/** 实例节点状态 */
const exampleNodeStatus = {
  IDLE: { icon: "el-icon-time", info: "初始化" },
  FLOWGEN: { icon: "gd-rely", info: "编排中" },
  RELY: { icon: "gd-rely", info: "等待前置依赖" },
  EXT_RELY: { icon: "gd-rely", info: "等待外部依赖" },
  LIMIT: { icon: "gd-idle", info: "限流排队" },
  READY: { icon: "gd-idle", info: "等待执行" },
  RUNNING: { icon: "gd-running", info: "执行中" },
  RETRY: { icon: "gd-retry", info: "等待重试" }, //  '重试中',
  SUCC: { icon: "gd-succ", info: "执行完成" },
  FAIL: { icon: "gd-fail", info: "执行失败" },
  FAILING: { icon: "gd-fail", info: "失败停止中" },
  KILLING: { icon: "gd--killing", info: "停止中" },
  KILLED: { icon: "gd-killed", info: "已停止" },
  FORCESUCC: {
    icon: "light-icon-canvas-force-success-state",
    info: "强制成功中",
  },
};

const exampleStatus = exampleNodeStatus;

/** TODO 新创建的实例节点状态,后续要跟上面旧的合并一下 */
const newExampleNodeStatus = {
  IDLE: { icon: "el-icon-time", info: "初始化" },
  FLOWGEN: { icon: "gd-rely", info: "编排中" },
  RELY: { icon: "gd-rely", info: "等待依赖" },
  READY: { icon: "gd-idle", info: "等待执行" },
  RUNNING: { icon: "gd-running", info: "执行中" },
  SUCC: { icon: "gd-succ", info: "执行完成" },
  FAIL: { icon: "gd-fail", info: "执行失败" },
  FAILING: { icon: "gd-fail", info: "失败停止中" },
  KILLING: { icon: "gd--killing", info: "停止中" },
  KILLED: { icon: "gd-killed", info: "已停止" },
  FORCESUCC: {
    icon: "light-icon-canvas-force-success-state",
    info: "强制成功中",
  },
  FORCERERUN: {
    icon: "light-icon-canvas-force-success-state",
    info: "强制重跑中",
  },
};

function getStatusInfo(node_state: string) {
  if (node_state === "CACHE") {
    return {
      icon: `${exampleNodeStatus.SUCC.icon} SUCC`,
      info: "已完成(缓存)",
    };
  }
  if (node_state === "SKIP") {
    return null;
  }

  return exampleNodeStatus[node_state as keyof typeof exampleNodeStatus]
    ? {
        ...exampleNodeStatus[node_state as keyof typeof exampleNodeStatus],
        icon: `${
          exampleNodeStatus[node_state as keyof typeof exampleNodeStatus].icon
        } ${node_state}`,
      }
    : null;
}
