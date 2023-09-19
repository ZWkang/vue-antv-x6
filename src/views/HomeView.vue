<script setup lang="ts">
import { Graph, Edge } from "@antv/x6";
import { ref, onMounted } from "vue";
import { createPorts } from "../drawer/Nodes/a";

import { Transform } from "@antv/x6-plugin-transform";
// import { Snapline } from "@antv/x6-plugin-snapline";
import { MiniMap } from "@antv/x6-plugin-minimap";
import { register, getTeleport } from "@antv/x6-vue-shape";
// import { ElMessage } from 'elment-plus'

import CustomNode from "../drawer/Nodes/CustomNode.vue";
import { DiagramBase } from "@/drawer/DiagramBase";

const container = ref<DiagramBase | null>(null);

const TeleportContainer = getTeleport();



onMounted(() => {
  container.value = new DiagramBase();
  container.value.init('#container', {});
  
});


function appendNode() {
  container.value?.appendNewNode({
                    "node_type_id": 1217,
                    "node_type": "input_tdw",
                    "label": "light-icon-component-output-tdw",
                    "description": "",
                    "node_name": "读取TDW",
                    "node_group": "读取",
                    "node_input": [],
                    "node_output": [
                        {
                            "type": "HIVE_TABLE",
                            "description": "节点数据输出",
                            "key": "OUTPUT_TABLE1"
                        }
                    ],
                    "conf_type": "only_out"
                })
}
</script>

<template>
  <main class="container">
    <div class="container__left">
      <div class="container__toolbar">
        <button @click="getEdges">获取链接边信息</button>
        <button @click="appendNode">新增组件</button>
      </div>

      <div class="container__nodes">
        <ul>
          <li>sql节点</li>
        </ul>
      </div>
    </div>

    <div id="container" style="border: 1px solid red"></div>
    <TeleportContainer />
  </main>
</template>

<style scoped lang="scss">
.container {
  display: flex;

  flex-direction: row;

  width: 100%;
  height: 100vh;

  &__left {
    height: 100%;
    flex: 0;
    flex-basis: 200px;
  }

  &__nodes {
  }

  #container {
    flex: 1;
    height: 100%;
  }
}
</style>
