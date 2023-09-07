<template>
  <div
    :class="[
      skip ? 'container container--skip' : 'container',
      tiplog && 'custom_node_active',
    ]"
  >
    <div
      :style="{
        'background-color': skip ? 'transparent' : iconColor,
      }"
      class="state-icon"
    ></div>

    <div
      class="tvision-node-dom-content container-title"
      style="position: relative"
    >
      {{ title }}
    </div>

    <div class="status-icon" :class="nodeStateIcon"></div>

    <div class="tvision-preview" title="被选中的节点将不会被合并执行"></div>
    <div class="tvision-node-dom-task_index">
      {{ task_index }}
    </div>

    <div class="tvision-node-dom-task_index flag-text">
      {{ flagText }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import type { Node } from "@antv/x6";

export default defineComponent({
  name: "ProgressNode",
  inject: ["getNode"],
  data() {
    return {
      percentage: 80,

      showFlagText: false,
      skip: false,
      iconColor: "",
      task_index: "",
      title: "",
      node_type: "",
      tiplog: false,
      flagText: "",
      node_state: "",

      showNodeStatus: false,
      showPreview: false,
    };
  },
  computed: {
    nodeStateIcon: {
      get() {
        return getStatusInfo(this.node_state)?.icon;
      },
      set(val: any) {},
    },
  },
  methods: {
    handleState({ current: data }: any) {
      const {
        flagText,
        skip_flag = false,
        task_index,
        tiplog,
        skipColor,
        skipMessage,
        label,
        name,
        preview,
        showNodeStatus,
        node_state,
      } = data;
      this.showFlagText = flagText || false;

      this.skip = skip_flag;

      console.log(task_index);

      this.task_index = String(task_index);

      this.node_state = node_state;

      this.showNodeStatus = showNodeStatus && node_state !== "SKIP";
      this.showPreview = preview;
      this.tiplog = tiplog;
      this.title = name;
      this.flagText = flagText;
    },
  },
  mounted() {
    const node = (this as any).getNode() as Node;
    console.log(node);

    console.log(node.size());
    this.handleState({
      current: node.getData(),
    });
    node.on("change:data", this.handleState);
  },

  unmounted() {
    const node = (this as any).getNode() as Node;
    node.off("change:data", this.handleState);
  },
});

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
</script>

<style scoped lang="css">
.tvision-node-dom-content {
  /* text-indent: px; */
  /* width: 100%; */
  /* overflow: hidden; */
  /* overflow: hidden; */
  /* color: var(--text-color); */
  /* text-overflow: ellipsis; */
  /* white-space: nowrap; */
}

.container {
  box-sizing: border-box;

  position: relative;
  width: 100%;
  height: 100%;

  background-color: #fff;

  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  /* width: 180px; */
  min-width: 0;
  /* height: 32px; */
  padding: 0 8px 0 4px;
  /* line-height: 30px; */
  /* background: #fff; */
  border: 1px solid #e3ecf4;
  border-radius: 6px;
  box-shadow: 0 2px 4px 0 rgb(194 202 232 / 24%);

  color: #152028;

  align-items: center;
}

.container:hover {
  border: 1px solid #366df4;
  box-shadow: 0 0 1px 2px #366df45e;
}

.container-title {
  /* width: 100%; */
  flex: 1;
  min-width: 0;
  overflow: hidden;
  color: #374774;
  text-overflow: ellipsis;
  white-space: nowrap;

  display: flex;
  align-items: center;
}

.container--skip {
  background-color: #dfdfdf;
}

.state-icon {
  display: inline-flex;
  box-sizing: border-box;
  margin-right: 5px;
  /* font-size: 20px; */
  width: 20px;
  height: 20px;
  color: red;
  background-color: red;
}

.status-icon {
  /* flex: 0; */
  /* margin-right: 15px; */
  width: 18px;
  height: 18px;
  background-color: red;
  flex-basis: 18px;
}

.tvision-node-dom-task_index {
  position: absolute;
  top: 4.5px;
  right: -25px;
  width: 24px;
  height: 24px;
  font-size: 12px;
  line-height: 12px;
  line-height: 22px;
  color: #a9b3d0;
  text-align: center;
  background-color: #fff;
  border: 1px solid #e8f0f7a8;
  border-radius: 4px;
  box-shadow: 0 2px 4px 0 rgb(194 202 232 / 24%);
}

.flag-text {
  position: absolute;
  right: -60px;
  color: #f66620;
  border-radius: 4px;
  width: auto;
  padding: 0px 4px;
  font-size: 12px;
}

.tvision-preview {
  position: absolute;
  top: 0;
  right: 0;
  border-top: 8px solid #67c23a;
  border-right: 8px solid #67c23a;
  border-bottom: 8px solid transparent;
  border-left: 8px solid transparent;
  border-top-right-radius: 6px;
}
</style>
