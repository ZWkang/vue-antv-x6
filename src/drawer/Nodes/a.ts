import { createShape } from '@antv/x6/es/shape/util'


// export const customNode = createShape('custom-node', {
//   attrs: {
//     body: {

//     },
//     icon: {
      
//     },
//     title: {
//       fontSize: 14,
//       refX: 10,
//     }
//   }
// })
const ModelInputAnchorColor  = {
  'MODEL': '#E6A23C',
  'default': '#366DF4',
}as const


const ModelOutputAnchorColor = {
  'MODEL': '#E6A23C',
  'default': '#06dd35',
} as const;

function createPortGroup({
  type
}: { type: string}, position: 'top' | 'bottom') {
  const base = {
    position: {
      name: position,
    },
    attrs: {
      circle: {
        r: 6,
        magnet: true,
        stroke: (ModelInputAnchorColor as any)[type] || ModelInputAnchorColor.default,
        strokeWidth: 2,
        fill: '#fff',
      },
      text: {
        fontSize: 12,
        fill: '#888',
      },

      type: type
    },
  }
  if(position === 'bottom') {
    base.position.name = position;

    base.attrs.circle.stroke = (ModelOutputAnchorColor as any)[type] || ModelOutputAnchorColor.default;
    return base;
  }

  return base;
}

function createPort({
  key,
  description,
  type
}: {
  key: string,
  description: string,
  type: string
}, id: string, position: 'top' | 'bottom') {

  const base =  {
    id: `${id}:${key}-top`,
    group: 'node_input',
    type: type,
    args: {
      key,
      description,
      type,
    }
  }

  if(position === 'bottom') {
    base.id = `${id}:${key}-bottom`;
    base.group = 'node_output';
    return base;
  }

  return base;
}


export function createPorts(
  {
    node_input = [],
    node_output = [],
    node_type= '',
  }: {
    node_input: any[],
    node_output: any[],
    node_type: string;
  },
  node_id: string,
) {

  if(['one_sql', 'one_sql_copy'].includes(node_type)) {
    return {
      groups: {
        node_input: createPortGroup({ type: node_type }, 'top'),
        node_output: createPortGroup({ type: node_type }, 'bottom'),
      },
      items: [
        ...node_input.map((item) => createPort(item, node_id, 'top')),
        ...node_output.map((item) => createPort(item, node_id, 'bottom')),
      ]
    }
  }

  return {
    groups: {
      node_input: createPortGroup({ type: node_type }, 'top'),
      node_output: createPortGroup({ type: node_type }, 'bottom'),
    },
    items: [
      ...node_input.map((item) => createPort(item, node_id, 'top')),
      ...node_output.map((item) => createPort(item, node_id, 'bottom')),
    ]
  }
}