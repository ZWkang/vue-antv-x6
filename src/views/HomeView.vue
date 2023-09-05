<script setup lang="ts">
import { Graph, Edge } from "@antv/x6";
import { ref, onMounted } from "vue";
import { createPorts } from "../drawer/Nodes/a";

import { Transform } from "@antv/x6-plugin-transform";
// import { Snapline } from "@antv/x6-plugin-snapline";
import { MiniMap } from "@antv/x6-plugin-minimap";

const container = ref<Graph | null>(null);

onMounted(() => {
  container.value = new Graph({
    container: document.getElementById("container")!,
    width: 800,
    height: 600,
    autoResize: true,

    connecting: {
      connectionPoint: "anchor",
    },
  });

  container.value.use(
    new Transform({
      resizing: {
        // enabled: true,
        enabled(node: any) {
          console.log(node);
          // const { enableOrthogonal } = node.getData()
          // return enableOrthogonal
          if (node.id === "111") return false;
          return true;
        },
      },
    })
  );

  container.value.on("cell:mouseover", ({ cell }) => {
    // console.log(cell)
    if (cell.isNode()) {
      cell.addTools([
        {
          name: "button-remove",
          args: {
            y: 0,
            x: "100%",
            offset: {
              x: 0,
              y: 0,
            },
          },
        },
      ]);
    }
  });
  const rect = container.value.addNode({
    shape: "rect",
    x: 100,
    y: 200,
    width: 80,
    height: 40,
    label: "rect",
    id: "111",
    ports: createPorts(
      {
        node_input: [
          {
            key: "port1",
            type: "port1",
            label: "port1",
            description: "xxxx",
          },
          {
            key: "port2",
            type: "port2",
            label: "port1",
            description: "xxxx",
          },
        ],
        node_output: [
          {
            key: "port1",
            type: "port1",
            label: "port1",
            description: "xxxx",
          },
        ],
        node_type: "only_input",
      },
      "111"
    ),
  });

  const rect2 = container.value.addNode({
    shape: "rect",
    x: 100,
    y: 400,
    width: 80,
    height: 40,
    label: "rect",
    ports: [
      // 默认样式
      { id: "port1" },
      // 自定义连接桩样式
      {
        id: "port2",
        attrs: {
          circle: {
            magnet: true,
            r: 8,
            stroke: "#31d0c6",
            fill: "#fff",
            strokeWidth: 2,
          },
        },
      },
    ],
  });

  setTimeout(() => {
    // console.log(container.value?.get());
    // rect2.getConnectionPoint();
    console.log(container.value?.getConnectedEdges(rect2))
  }, 6000)
  // container.value.removeCell('111')
});

function getNodes() {
  console.log(container.value.getNodes());
}

function getEdges() {
  console.log(container.value.getEdges());
}
</script>

<template>
  <main>
    <!-- <button @click="getEdges">get Edges</button> -->
    <!-- <button @click="getNodes">getNodes</button> -->
    <div id="container-minimap"></div>
    <div id="container" style="border: 1px solid red"></div>
  </main>
</template>
