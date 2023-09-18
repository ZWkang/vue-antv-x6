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

const container = ref<Graph | null>(null);

const TeleportContainer = getTeleport();

register({
  shape: "custom-vue-node",
  width: 180,
  height: 32,
  component: CustomNode,
});

onMounted(() => {
  container.value = new Graph({
    container: document.getElementById("container")!,
    width: 800,
    height: 600,
    autoResize: true,
    highlighting: {
      // 当连接桩可以被链接时，在连接桩外围渲染一个 2px 宽的红色矩形框
      magnetAdsorbed: {
        name: "stroke",
        args: {
          attrs: {
            fill: "#fff",
            stroke: "#000",
            strokeWidth: 4,
          },
        },
      },
      magnetAvailable: {
        name: "stroke",
        args: {
          attrs: {
            fill: "#fff",
            stroke: "#000",
            strokeWidth: 4,
          },
        },
      }
    },
    connecting: {
      highlight: true,
      allowNode: false,
      allowBlank: false,
      connectionPoint: "anchor",
      // allowMulti: 'withPort',
      // allowMulti: 'withPort',
      // validateMagnet({ magnet }) {
      //   console.log('xxx')
      //   return true
      // },
      validateConnection({ sourceView, targetView, sourceMagnet, targetMagnet, sourcePort, targetPort, edge, targetCell }) {
        // console.log('xxx2')
        if(!targetCell?.isNode()) return false;
        const allConnect = container.value?.getConnectedEdges(targetCell);
        const connectedEdges = allConnect?.filter(connect => {
          return connect.id !== edge?.id;
        })

        console.log(connectedEdges)
        const returnVal = connectedEdges?.every(_edge => {
          const _targetPort = _edge.getTargetPortId();
          const _sourcePort = _edge.getSourcePortId();
          console.log(_targetPort, _sourcePort, targetPort, sourcePort)
          if(_targetPort === targetPort && _sourcePort === sourcePort) {
            return false;
          }
          return true; 
        })

        if(!returnVal) {
          console.log('不允许连接')
        }

        return returnVal ?? false;
      }

    // // 如果目标节点已经有连接，则不允许创建新的连接
    // if (hasExistingConnection) {
    //   console.log('有过连接了')
    //   return false;
    // }

    // // 允许创建新的连接
    // return true;
    //   },
      // validateEdge({ edge }) {
      //   // console.log('xxx3')
      //   // console.log(edge);
      //   const dge = edge.getConnectionPoint();
      //   const target = edge.getTargetCellId();
      //   if(!target) {
      //     console.log('empty');
      //     // return true;
      //     return false;
      //   }

      //   rect2.ports.items[1].attrs.circle.stroke = 'red';
      //   return true;
      // }

      // validateEdge({ edge }) {
      //   // return true;
      //   console.log(edge, 'validateConnection' );
      //   const targetNode = edge!.getTargetNode();
      //   if(!targetNode?.isNode()) return true;
      //   const targetPortId = edge!.getTargetPortId();
      //   const sourcePortId = edge!.getSourcePortId();
      //   const edges = container.value?.getConnectedEdges(targetNode)
      //   console.log(edges)
      //   const returnVal = edges!.every(edge => {
      //     const targetPort = edge.getTargetPortId();
      //     const sourcePort = edge.getSourcePortId();

      //     console.log(edges, targetPort, targetPortId)
      //     if(targetPortId === targetPort && sourcePortId === sourcePort) {
      //       return false;
      //     }
      //     return true;
      //   }) ?? true

      //   if(!returnVal) {
      //     // ElMeesage.error('该端口已被占用');
      //     console.log('不允许重复链接');   
      //   }

      //   return returnVal;
      // }
    },
  });

  container.value.use(
    new Transform({
      resizing: {
        enabled: true,
        // enabled(node: any) {
        //   console.log(node);
        //   // const { enableOrthogonal } = node.getData()
        //   // return enableOrthogonal
        //   if (node.id === "111") return false;
        //   return true;
        // },
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
    shape: "custom-vue-node",
    x: 100,
    y: 200,
    width: 180,
    height: 32,
    label: "rect",
    id: "111",
    effect: ["width", "height"],
    data: {
      name: "读取 TDW-2",
      node_state: "SUCC",
      task_index: 2,
      flagText: "已完成",
      node_inputs: [
        {
          key: '1',
          type: 'port1',
          label: 'port1',
          description: 'xxxx',
          table_name: 'xxx'
        }
      ]
    },
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
        node_type: "one_sql",
      },
      "111"
    ),
  });

  // container.value.on('edge:mousemove', ( cell ) => {
  //   console.log(cell)
  // })
  container.value.on("node:port:click", ({ cell, port }) => {
    console.log(cell, port);
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
      { id: "port1", zIndex: 1002, position: {

      } },
      // 自定义连接桩样式
      {
        id: "port2",
        zIndex: 1002,
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
    console.log(container.value?.getConnectedEdges(rect2));
    // console.log(rect.getData());
  }, 6000);
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
    <!-- <div id="container-minimap"></div> -->
    <div @click="getEdges" style="position:absolute; top: 0; left: 0;">获取链接边信息</div>
    <div id="container" style="border: 1px solid red"></div>
    <TeleportContainer />
  </main>
</template>
